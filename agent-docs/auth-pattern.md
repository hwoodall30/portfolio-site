# Authentication Pattern

## Status and relationship to features

Authentication is not implemented. There is no auth provider, session verification hook, protected route group, login/logout flow, or session type in `App.Locals` yet. This document defines the integration boundaries for a future implementation; helper names below are proposed contracts, not existing imports.

Follow [feature-pattern.md](feature-pattern.md) for remote functions, page boundaries, and stores. This document owns session verification, page protection, and authorization. Choose the auth provider/library and session strategy when implementing auth, then update this document to match the actual files and types. JWTs, custom credential verification, token stores, and customer tokens are not established conventions in this repo.

## Server session boundary

Put provider integration and session helpers in `$lib/server/`. Use `src/hooks.server.ts` to verify request credentials and populate a typed, nullable `App.Locals` identity/session. Invalid or expired credentials produce an anonymous identity; use the chosen provider's cookie and session cleanup APIs.

A proposed `requireUser()` helper reads the verified request identity through `getRequestEvent().locals`, returns the authenticated user, or raises a SvelteKit 401 error. Keep this helper server-only. Remote functions, hooks, and server loads should share server helpers rather than calling a client-callable session query to authenticate.

Keep credentials, provider tokens, and session secrets on the server. For cookie sessions, use HTTP-only cookies with an explicit path, appropriate SameSite policy, and secure transport in production. Implement creation, expiration, revocation, and logout through the chosen session strategy.

## Protecting pages: the route group + hook

When auth exists, place protected pages beneath `src/routes/(authenticated)/`. Gate page requests in the server hook using the matched route group and verified identity, redirecting anonymous page requests to the implemented login route. The group name only organizes routes; the hook supplies enforcement.

Protected pages live under `src/routes/(authenticated)/`. Pages outside that group are public. `src/hooks.server.ts` gates the group:

```ts
export const handle: Handle = async ({ event, resolve }) => {
	event.locals.session = null;

	if (event.route.id === '/login') {
		const result = await getSession();
		if (result.error !== null) error(503, 'Unable to verify session. Please try again.');
		if (result.data !== null) redirect(303, '/');
		clearAuth(event);
	}

	if (event.route.id?.includes('/(authenticated)')) {
		const result = await getSession();
		if (result.error !== null) error(503, 'Unable to verify session. Please try again.');
		if (result.data === null) {
			clearAuth(event);
			redirect(303, '/login');
		}
		event.locals.session = result.data;
	}

	return resolve(event);
};
```

`getSession()` is a proposed server-only helper that reads credentials from the current request through `getRequestEvent()` and wraps the provider's session verification operation in `attempt<string, Session | null>`. It returns the awaited result envelope: `{ data: session, error: null }` for a verified session, `{ data: null, error: null }` for absent, invalid, or expired credentials, and `{ data: null, error: message }` for an operational failure. `Session` represents the eventual provider-backed session type. Normalize the provider's expected invalid/expired credential outcomes to a successful `null` result inside the operation; unexpected provider failures remain operation failures. Follow [attempt-pattern.md](attempt-pattern.md) for diagnostics and safe error messages.

Callers inspect `result.error !== null` before using `result.data`; consume this result directly rather than wrapping `getSession()` in another `attempt`. Keep SvelteKit `error(...)` and `redirect(...)` calls outside the callback. The hook reports verification outages with a safe 503 response, preserving credentials so the user can retry, and only clears auth or redirects to sign-in after a successful anonymous result.

`clearAuth(event)` clears the current request's auth cookies using the selected provider's cleanup APIs and sets `event.locals.session` to `null`. Implement both helpers with the selected auth provider and declare the matching nullable `App.Locals.session` type in `src/app.d.ts`. `/login` and `/` are example destinations to align with the eventual routes. This example assumes the protected group contains pages; protect any server endpoints independently at their operation boundary as well.

Use `(authenticated)/+layout.server.ts` to return only the user fields needed by the UI. The layout can provide those fields to descendants through props or a per-tree context store. Layout loads supply UI data; each protected server operation still checks identity and permissions independently.

Every page that needs to be protected needs a `+page.server.ts` in order for the hook to run. It can be empty, but the file must be present.

Apply page redirects only to page requests. Remote calls need their own auth checks and failure handling rather than relying on a page-route match or a layout having run.

## Protected remote functions

Every protected query, command, and form verifies identity and resource access on the server. Public endpoints such as sign-in are deliberate exceptions and perform their own input/credential checks.

Use this order:

1. Validate input with the remote function's schema.
2. Resolve the verified user with the server-only auth helper. For protected queries, centralize this in the higher-order `guardQuery` handler wrapper described in [feature-pattern.md](feature-pattern.md#guarded-queries); commands and forms enforce the same check in their own handlers.
3. Enforce permission and ownership at the privileged service/data boundary. Scope reads and writes to the verified user; treat client-provided IDs as untrusted selectors.
4. Wrap only the feature operation in `attempt` when returning an operation result. Keep SvelteKit auth errors, redirects, and validation outside the callback.
5. Return a serializable success value or safe operation failure message. Refresh affected feature queries after mutations.

Illustrative command/form operation body, after the corresponding auth and persistence helpers have been implemented (guarded query handlers receive `user` from the wrapper instead):

```ts
const user = requireUser(); // raises 401 outside attempt

// Access checks use verified identity, not a user id supplied by the client.
await requireWidgetAccess(user.id, params.widgetId); // raises 403/404 outside attempt

const result = await attempt<string, Widget>(() => readWidgetForUser(user.id, params.widgetId));

if (result.error !== null) {
	return { data: null, error: 'Unable to load widget.' } as const;
}

return result;
```

The service must also scope its actual read/write to that identity so ownership remains enforced at the point of access. These names illustrate responsibilities, not a dependency on an existing widget feature.

`attempt` catches thrown values. Wrapping the entire handler would turn auth errors or redirects into ordinary result data. Follow [attempt-pattern.md](attempt-pattern.md) for result handling and safe public errors; retain framework control flow outside that wrapper.

## Sign-in, logout, and client behavior

Implement sign-in and logout using the chosen provider's supported server flow. If remote forms are used, preserve their native validation contract and perform success redirects outside `attempt`. Logout invalidates the server session where supported and clears its cookies.

Client user data supports display and navigation only. Hiding a control does not authorize an operation. Handle expired-session remote failures by taking the user through the implemented sign-in flow; keep that behavior distinct from an operation's returned `{ data, error }` result.

## Completion checks when auth is implemented

Verify anonymous page access, direct anonymous remote calls, invalid/expired sessions, cross-user resource access, sign-in, and logout. Confirm the client receives only its minimal user projection and that auth failures retain framework behavior rather than becoming successful operation envelopes. Replace proposed contracts in this document with actual paths and types.

## Framework references

- [SvelteKit auth integration](https://svelte.dev/docs/kit/auth)
- [Remote functions and request context](https://svelte.dev/docs/kit/remote-functions)
