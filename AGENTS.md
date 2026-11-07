## Project Configuration

- **Language**: TypeScript
- **Package Manager**: bun
- **Add-ons**: prettier, tailwindcss, vitest, eslint, playwright, experimental

---

## Agent skills

### Issue tracker

Issues live in local Markdown under `.scratch/`. Before reading or writing tickets, read `docs/agents/issue-tracker.md`.

### Triage labels

Use the five default triage roles. Before triaging, read `docs/agents/triage-labels.md`.

### Domain docs

Use a single-context layout. Before exploring the codebase, read `docs/agents/domain.md`.

## Architecture

**SvelteKit 3 + Svelte 5** full-stack app. Uses Svelte 5 runes (`$state`, `$derived`, `$effect`) — not legacy stores syntax.

### Remote Functions (Server RPC)

Use `src/lib/remote-functions/*.remote.ts` for server queries and mutations. Remote functions and async components are enabled in `vite.config.ts`. Use `attempt` from `$lib/helpers/attempt` for operation results; follow [agent-docs/feature-pattern.md](agent-docs/feature-pattern.md).

Authentication is not implemented. Before adding authentication, protecting routes, or accessing user-owned data, read [agent-docs/auth-pattern.md](agent-docs/auth-pattern.md).

### Component Structure

- `/src/lib/components/ui/` — shadcn-svelte base components (Bits UI based)
- `/src/lib/components/app/` — domain-specific components (sidebar, page wrappers, data tables)

Custom components must follow shadcn-style composability: expose focused parts that callers assemble through Svelte 5 children/snippets. For multi-part components, export named parts from a local `index.ts` so callers can compose APIs such as `<Panel.Root>`, `<Panel.Header>`, and `<Panel.Content>`. Keep layout and content customizable at the call site rather than controlling every variation through a growing set of props or boolean flags. Forward appropriate element props and support `class` overrides on the relevant parts; build on existing UI primitives when applicable. Simple components can remain a single component when separate parts add no useful composition.

## Feature Pattern

Before adding or restructuring a page, store, or remote function, read
[agent-docs/feature-pattern.md](agent-docs/feature-pattern.md).

## Attempt Pattern

Before adding or changing fallible operations or error handling on the server or client, read [agent-docs/attempt-pattern.md](agent-docs/attempt-pattern.md).

## Key Config

- **TypeScript**: strict mode, `moduleResolution: bundler`
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin
- **Prettier**: tabs, single quotes, no trailing commas, print width 100
- **ESLint 10** flat config with TypeScript + Svelte rules
- **Adapter**: `@sveltejs/adapter-auto`
