# Attempt Pattern

## Purpose and scope

Use `attempt` from `$lib/helpers/attempt` at recoverable operation boundaries throughout the app: server I/O, remote query/command operations, browser APIs, parsing untrusted data, and client event handlers. Every captured failure needs an explicit outcome: return a safe failure, show recovery UI, retry deliberately, or propagate to the appropriate error boundary.

Wrap the smallest operation whose failure you can meaningfully handle. Pure calculations, ordinary state assignments, and functions that already return a handled result do not need another wrapper. Catching an error does not validate input, authorize access, roll back writes, or make an operation safe by itself.

[feature-pattern.md](feature-pattern.md) owns feature data flow and guarded query composition. [auth-pattern.md](auth-pattern.md) owns authentication and authorization. Their framework control flow remains outside `attempt`.

## Current helper contract

The implementation is [src/lib/helpers/attempt.ts](../src/lib/helpers/attempt.ts). It supports synchronous callbacks and callbacks returning a Promise:

```ts
import { attempt } from '$lib/helpers/attempt';

const parsed = attempt<string, unknown>(() => JSON.parse(input));
const loaded = await attempt<string, Response>(() => fetch(url));
```

| Outcome        | Result                           |
| -------------- | -------------------------------- |
| Success        | `{ data: value, error: null }`   |
| Caught failure | `{ data: null, error: message }` |

Use `result.error !== null` to select the failure branch, then access `result.data` in the success branch. Truthiness checks on `data` misclassify valid values such as `0`, `false`, or an empty string. An error message can also be empty, so avoid `if (result.error)`.

The helper has implementation limitations to account for:

- Its default generics are `E = Error` and `T = any`, but caught errors are converted to strings. Specify `attempt<string, ResultType>`; selecting a generic error type does not perform runtime conversion or validation.
- Synchronous `Error` failures use `.message`; Promise rejections use `toString()`, which may include an `Error:` prefix. Treat messages as text, not stable error codes or `Error` objects.
- A thrown/rejected `null` or `undefined` produces an undefined error despite the declared type. An arbitrary object's `toString()` can itself throw. Use `Error` instances in app-owned throwing code; normalize unknown third-party failures at their integration boundary if necessary. The current helper is not a guarantee against every possible rejection.
- Use native Promises or `async` callbacks for async work. The Promise-like check accepts thenables, but the implementation expects chained `.then(...).catch(...)` behavior.

These are current behavior, not desired guarantees. If changing the helper, update this contract and verify synchronous success/failure, Promise success/rejection, and unknown thrown values.

## Server operations and safe responses

Authenticate, validate input, and enforce authorization before entering an operation callback. Keep `redirect(...)`, SvelteKit `error(...)`, and framework validation outside it, including in functions called by the callback. `attempt` cannot distinguish those thrown signals from ordinary failures.

Use the helper around persistence or external-service work. Convert internal errors into a fixed, feature-specific public message at the server response boundary. Return only serializable data needed by the client. Raw database, provider, and network error text can expose implementation details or sensitive information.

```ts
// Illustrative remote handler body after authorization; service/type are placeholders.
const result = await attempt<string, SavedItem>(() => saveItemForUser(user.id, input));

if (result.error !== null) {
	return { data: null, error: 'Unable to save item.' } as const;
}

return result;
```

Keep useful diagnostics on the server using the app's logging mechanism, with secrets, credentials, and personal data redacted. The helper itself neither logs nor sanitizes errors and loses the original Error object and stack. Where preserving structured diagnostics matters, log at the integration boundary before converting to a result.

For `fetch`, check `response.ok` explicitly: HTTP failure statuses do not reject the Promise. Validate parsed response data before treating it as a domain type. A successful `attempt` only means the callback completed without throwing.

Let inner services throw ordinary operation errors and convert them once at the boundary that owns the response. When calling an existing result-returning operation, inspect its result directly; wrapping it again creates a second result layer rather than handling its failure.

## Initial page loading

Await initial remote data in the child component enclosed by the route's boundary, as described in the feature pattern. A remote call may reject for transport or framework reasons, or resolve with an operation failure. Handle the returned result explicitly; let rejected initial calls reach the boundary.

```ts
const result = await getItems(); // illustrative query
if (result.error !== null) throw new Error(result.error);
// Use result.data only after the failure check.
```

Use generic public wording in failed UI. A boundary provides recovery UI; it does not replace server authorization or error sanitization.

## Client events and mutations

Event handlers own their failures; rendering boundaries do not catch event-handler errors. For a remote call that returns a result, distinguish a rejected call from a returned operation failure. An outer `attempt` is useful here specifically for the transport failure; inspect both layers.

```ts
// Illustrative component handler; saveItem returns the server result envelope.
async function handleSave() {
	if (saving) return;
	saving = true;
	saveError = null;

	try {
		const call = await attempt(() => saveItem(input));
		if (call.error !== null) {
			saveError = 'Unable to reach the server. Please try again.';
			return;
		}

		const result = call.data;
		if (result.error !== null) {
			saveError = result.error; // server-sanitized public message
			return;
		}

		// Reconcile local state and refresh affected queries after confirmed success.
	} finally {
		saving = false;
	}
}
```

For protected remote calls, integrate the auth pattern's expired-session handling before treating a rejection as a generic connectivity failure. Browser APIs such as clipboard or storage can use the same operation-boundary approach with an appropriate visible fallback. Keep user edits available when a save fails. Handle failures from subsequent refresh/reconciliation work as well; report a refresh failure separately from an already successful write.

Use `finally` for cleanup such as saving flags and resource release. Traditional `try`/`catch` remains appropriate when error identity, framework signals, or cleanup require it; `attempt` is a result-handling tool, not a replacement for all exception handling.

## Recovery and side effects

Await operations whose outcomes matter. For intentionally detached work, attach an explicit failure handler; a discarded result silently hides failure. For independent work run in parallel, inspect every result rather than accepting partial success implicitly.

Retry only when the failure is recoverable and the operation is safe to repeat. A network failure can occur after a server write succeeded; use an idempotency strategy or reconcile server state before repeating a mutation. Use database transactions for multi-step writes that must succeed together. `attempt` supplies neither retries nor atomicity.

When adding or changing a failure path, verify its visible outcome, loading-state cleanup, preservation of edits, safe public message, and server-side permissions. Exercise both returned failures and rejected calls when both can occur.
