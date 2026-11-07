# Hunter Woodall — Portfolio

A responsive SvelteKit 3 / Svelte 5 portfolio focused on engineering leadership, frontend craft, and practical AI. Built with TypeScript, Bun, Tailwind CSS, shadcn-svelte primitives, and Three.js.

## Development

```sh
bun install
bun run dev
```

## Role matching

Visitors paste a role or team challenge, then choose **Match this role**. Before the first model download, the site asks for consent and explains the download size. Once enabled, matching runs on the visitor’s device. The results connect requirements to all retrieved authored experience records, with links to the supporting material. Requirements that the published material does not establish are shown separately. These are possible connections to review, not hiring scores or verified qualification assessments.

Three clearly labeled, authored example previews work instantly without a model download. Editing the input clears previous results. Errors preserve the input, and downloads or inference can be canceled. Recoverable matching errors retain the loaded model for retry. Technical details distinguish inference and response-validation failures; Reload model explicitly releases the current worker without deleting its cached files. The rest of the portfolio is always readable without AI.

WebLLM runs Qwen2.5-0.5B-Instruct in a dedicated worker using WebGPU. The first download is roughly 400 MB plus runtime files from Hugging Face and MLC. Browser Cache Storage retains model files when available. Open **Model download & storage** in the matcher to see cached models, complete versus partial weight downloads, and clear all WebLLM model/configuration/runtime caches for this site. This does not clear models stored by other websites, browser profiles, or localhost ports. Cached weights still need to load into GPU memory. The UI distinguishes loading cached weights from a first download. Prompts stay on the device. No account, API key, hosted inference service, or usage bill is required. Browser support, GPU memory, network access, and storage availability vary.

Matching first retrieves evidence using authored topic tags. Normalization handles spelling variants such as front end/front-end/frontend, common vocabulary equivalents, and word forms. Matching tags receive inverse-frequency weights; an entry qualifies when its strongest matching tag scores at least 45% of the best entry for that requirement. This keeps broad topic queries inclusive while preferring specific evidence for narrower requests. Tags describe relevance; published facts establish the actual experience. The vocabulary is finite: unfamiliar paraphrases can still miss evidence, and matches need human review.

The local model ranks only those retrieved candidates. It receives their titles, facts, and tags and returns a requirement-ID-to-evidence-ID mapping. Runtime validation rejects unknown or unrelated IDs, duplicate selections, and malformed responses. The application restores omitted candidates and derives gaps itself. If ranking fails, retrieved matches remain available and a console warning explains the fallback. Browser console debug messages show retrieved candidates and raw model responses. Requirement text is copied directly from the input; career facts and links come exclusively from authored records. No text is executed or rendered as HTML.

The hero ballpark is a separate personal visual: drag horizontally to rotate, or drag vertically with a mouse/pen to tilt. Touch retains vertical page scrolling. Rotation buttons remain available for keyboard users. Geometry is authored locally, rendering happens on demand, and unavailable WebGL falls back to a vector overview.

## Validation

```sh
bun run check
bun run test:unit --run
bun run test:e2e
bun run build
```

Install browser dependencies if needed with `bunx playwright install chromium`. Unit tests cover evidence grounding, validation, and the authored retrieval evaluation set. Browser tests cover example previews, consent, successful matching with a simulated worker, invalid responses, unsupported devices, cancellation, source links, drag rotation, responsive layouts, and the resume. Desktop/mobile screenshots are captured under the ignored `test-results/` directory.

To download the actual model and test live inference on a WebGPU-capable browser:

```sh
PORTFOLIO_AI_SMOKE=1 bun run test:e2e --grep 'real local model'
```

That opt-in run checks every expected evidence ID across 64 authored queries: broad frontend/backend topics, technology names, projects, paraphrases, mixed requirements, and unsupported claims. It writes a `model-evaluation.json` attachment under `test-results/` containing expected and actual IDs plus raw model responses. This measures the integrated retrieval-and-ranking pipeline, rather than model-only semantic accuracy. Set `PORTFOLIO_AI_CASES` to a regular expression to run a focused subset. The run enables WebGPU in headless Chromium and skips when no usable adapter exists. Simulated-worker tests verify application behavior; they do not establish the real model’s inference quality.

## Files

- `src/routes/_components/portfolio-page.svelte`: narrative, achievements, case study, and contact.
- `src/routes/_components/role-matcher.svelte`: role input, consent, progress, results, and recovery.
- `src/lib/role-match/`: approved evidence, example previews, validation, local AI client, and worker.
- `src/lib/ballpark/scene.ts`: Three.js ballpark and pointer controls.
- `src/lib/components/app/ballpark.svelte`: scene lifecycle and graphics fallback.
- `src/routes/layout.css`: responsive visual system and reduced-motion support.
- `static/Hunter-Woodall-Resume.pdf`: supplied resume, served for viewing and download.

Contact details and public achievements come from the supplied resume. The merchandising story uses the account approved for publication. The role matcher needs no server queries, authentication, or persistence.

## Coolify deployment

The Node adapter builds a standalone production server into `build/`. The `start` script runs `node build`; use Node 22 for build and runtime.

For a GitHub-connected application using Nixpacks, configure:

- Site type: Dynamic (disable static-site mode).
- Install command: `bun install --frozen-lockfile` (include development dependencies for the build).
- Build command: `bun run build`.
- Start command: `bun run start` (or directly `node build`).
- Exposed port: `3000`.
- Runtime environment: `HOST=0.0.0.0`, `PORT=3000`, and `ORIGIN=https://your-actual-domain`.

Save the settings and redeploy after committing and pushing these changes. Use the final public HTTPS origin, including a custom port if applicable, without a path. HTTPS also enables browser-local AI/WebGPU. A blank start command can leave the container executing Bash without a command; the Node adapter and explicit start command supply the production entry point.
