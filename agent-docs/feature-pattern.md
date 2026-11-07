# Feature Pattern

## Scope and current state

This is the target structure for new features. Remote functions and async components are enabled in the SvelteKit plugin in `vite.config.ts`. The local result helper exists at `src/lib/helpers/attempt.ts`; the feature files below are illustrative and must be created as needed.

Authentication is not implemented. Before adding auth, protecting a route, or accessing user-owned data, read [auth-pattern.md](auth-pattern.md). That document owns session handling and authorization; this document owns feature data flow and UI state.

## Feature layers

1. **Remote functions** validate input and perform server reads and mutations.
2. **Route page** (`+page.svelte`) renders the header and a `<svelte:boundary>` with loading and error UI.
3. **Page component** (`_components/<feature>-page.svelte`) awaits initial data inside that boundary and seeds route state.
4. **Route store**, when shared editable state is needed, lives in `_store/<feature>.svelte.ts` and is provided through Svelte context.

Page data flows through remote functions. Reserve server layout loads for the future auth layout's minimal client session projection, as described in the auth pattern.

```text
src/lib/
  remote-functions/<feature>.remote.ts
  server/<feature>.ts                    # server-only persistence/service code
  types/<feature>.ts                     # shared types and default factories
src/routes/<feature>/
  +page.svelte
  _components/<feature>-page.svelte
  _store/<feature>.svelte.ts             # only when needed
```

Use ordinary routes while auth is absent. When protection is implemented, place protected features beneath `(authenticated)/` following the auth pattern. A route group alone provides no security.

## Remote functions and results

Use one `<feature>.remote.ts` per feature. Use `query` for reads, `command` for programmatic mutations, and `form` for form submissions. Validate client input with a supported Standard Schema implementation; no schema package has been selected or installed yet. Keep persistence and reusable server logic in `$lib/server/`.

Use `attempt` from `$lib/helpers/attempt` for recoverable query and command operation results. Before implementing operation wrappers, public error messages, or client mutation handling, read [attempt-pattern.md](attempt-pattern.md). It owns the helper contract, limitations, and recovery rules.

Forms retain SvelteKit's validation and submission contract. Apply `attempt` only to their underlying operation when useful; perform validation feedback and success redirects afterward. Authentication and authorization follow [auth-pattern.md](auth-pattern.md#protected-remote-functions).

### Guarded queries

When implementing authenticated reads, create a reusable higher-order query-handler function, `guardQuery`, in `$lib/server/remote-guards.ts`. This helper is a proposed convention and does not exist yet; implement it alongside the auth setup rather than adding a placeholder that permits anonymous access.

Keep SvelteKit's `query(schema, handler)` declaration in the `.remote.ts` file and wrap its handler with `guardQuery`. The wrapper resolves the authenticated user on every invocation using the server-only `requireUser()` contract from the auth pattern, then passes validated params and the verified user to the handler. Preserve inferred input and return types with generics. Resolve request identity inside the callback, never at module initialization.

```ts
// Illustrative declaration after the schema, guard, and service exist.
export const getWidget = query(
	GetWidgetSchema,
	guardQuery(async (params, user) => {
		await requireWidgetAccess(user.id, params.widgetId);

		const result = await attempt<string, Widget>(() => readWidgetForUser(user.id, params.widgetId));

		if (result.error !== null) {
			return { data: null, error: 'Unable to load widget.' } as const;
		}

		return result;
	})
);
```

Use the guard for every query requiring a signed-in user; deliberately public queries use a plain handler. The guard owns authentication, while the handler and service own resource-specific authorization and user-scoped access. Keep both checks outside `attempt`. The guard must let framework errors and redirects propagate and must preserve the handler's return value rather than wrapping the whole handler in `attempt`. Commands and forms still enforce authentication independently; a query guard does not protect mutations.

## Route boundary and initial data

Keep the initial `await` in the child page component so the route boundary encloses it. Use existing UI components or simple markup for pending, failed, and empty states; skeleton and toast components are not established dependencies here.

```svelte
<!-- src/routes/widgets/+page.svelte; illustrative feature -->
<script lang="ts">
	import WidgetsPage from './_components/widgets-page.svelte';
</script>

<svelte:boundary>
	<WidgetsPage />

	{#snippet pending()}
		<p>Loading widgets...</p>
	{/snippet}

	{#snippet failed(error, reset)}
		<p>Unable to load widgets.</p>
		<button onclick={reset}>Try again</button>
	{/snippet}
</svelte:boundary>
```

In the child component, await the query and inspect `result.error !== null` before using `result.data`. For an operation failure, throw `new Error(result.error)` to reach the boundary's failed UI. Fetch independent initial data with `Promise.all`. Render an explicit empty state for successful empty results.

Treat later mutation failures in the event handler: display a safe message and clear the saving flag in `finally`. Handle both returned failures and rejected calls. Boundaries do not handle errors from event handlers. After success, refresh affected queries and reconcile any editable store with the saved result.

## Stores and context

Use a class in a `*.svelte.ts` file for shared editable route state:

- `$state` fields hold editable values, initialized by a default factory where appropriate.
- `$derived` fields hold computed values.
- Methods apply state replacements or domain edits.
- `set<Name>StoreContext()` creates the store with `setContext`; `get<Name>StoreContext()` retrieves it with `getContext`. Use a module-level `Symbol` as the key.

Create context synchronously before the first `await`, then seed the store after successful loading. Child sections can read and bind to the shared store. Simple list pages can render query data directly without a store.

Create each store per component tree, including during SSR; keep mutable user state out of module-level singleton instances. Create app-wide stores only for state actually shared across routes. Future auth UI receives a minimal user projection from the protected layout; server credentials and tokens stay on the server.

When route parameters change, ensure the query and editable state follow the new entity, using a keyed component or reactive data flow. Initialization alone must not leave the previous entity's data visible.
