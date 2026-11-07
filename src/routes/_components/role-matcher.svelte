<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { inspectModelCache, clearModelCache, type ModelCache } from '#lib/role-match/cache.js';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import { attempt } from '#lib/helpers/attempt.js';
	import { roleExamples, getEvidence, type RoleMatch } from '#lib/role-match/evidence.js';
	import type { createLocalAI } from '#lib/role-match/local-ai.js';
	import { MODEL_ID } from '#lib/role-match/config.js';

	let input = $state('');
	let result = $state<RoleMatch | null>(null);
	let resultSource = $state<'example' | 'ai'>('example');
	let aiState = $state<'off' | 'loading' | 'ready' | 'working'>('off');
	let consent = $state(false);
	let progress = $state(0);
	let error = $state('');
	let errorDetails = $state('');
	let cached = $state<ModelCache | null>(null);
	let cacheMessage = $state('Checking model storage…');
	let clearing = $state(false);
	async function refreshCache() {
		const inspected = await attempt<string, ModelCache>(() => inspectModelCache());
		if (inspected.error !== null) {
			cacheMessage = 'Browser model storage is unavailable.';
			return;
		}
		cached = inspected.data;
		cacheMessage = cached.files
			? `${cached.files} model-related files stored for this site.`
			: 'No model files stored for this site.';
	}
	async function clearDownloads() {
		clearing = true;
		cancel();
		const cleared = await attempt<string, void>(() => clearModelCache());
		if (cleared.error !== null)
			cacheMessage =
				'Could not clear model storage. You can clear this site’s data in browser settings.';
		else await refreshCache();
		clearing = false;
	}
	onMount(() => {
		void refreshCache();
	});
	let ai = $state.raw<Awaited<ReturnType<typeof createLocalAI>> | null>(null);
	let controller: AbortController | null = null;
	let operation = 0;
	const busy = $derived(aiState === 'loading' || aiState === 'working');
	const weightsCached = $derived(
		cached?.models.some((model) => model.name === MODEL_ID && model.complete) ?? false
	);
	function preview(index: number) {
		const example = roleExamples[index];
		input = example.input;
		result = example.result;
		resultSource = 'example';
		consent = false;
		error = '';
		errorDetails = '';
	}
	function cancel() {
		operation++;
		controller?.abort();
		ai?.dispose();
		ai = null;
		aiState = 'off';
	}
	async function match(download = false) {
		if (busy || !input.trim()) return;
		if (!ai && !download) {
			consent = true;
			return;
		}
		const version = ++operation;
		const text = input.trim();
		consent = false;
		error = '';
		result = null;
		if (!ai) {
			aiState = 'loading';
			progress = 0;
			controller = new AbortController();
			const signal = controller.signal;
			const loaded = await attempt<string, Awaited<ReturnType<typeof createLocalAI>>>(async () => {
				if (!('gpu' in navigator) || !navigator.gpu) throw new Error('WebGPU unavailable');
				const { createLocalAI } = await import('#lib/role-match/local-ai.js');
				return createLocalAI((value) => {
					if (version === operation) progress = Math.round(value * 100);
				}, signal);
			});
			if (version !== operation) {
				if (loaded.error === null) loaded.data.dispose();
				return;
			}
			if (loaded.error !== null) {
				aiState = 'off';
				error =
					'Local AI could not start. It needs WebGPU, enough GPU memory, and a connection for the download. Try an example below, or explore the experience on this page.';
				errorDetails = loaded.error;
				void refreshCache();
				return;
			}
			ai = loaded.data;
			void refreshCache();
		}
		aiState = 'working';
		const matched = await attempt<string, RoleMatch>(() => ai!.match(text));
		if (version !== operation) return;
		if (matched.error !== null) {
			if (ai?.available) aiState = 'ready';
			else cancel();
			errorDetails = matched.error;
			error =
				'Local matching failed. Your text is still here. See the technical details below, retry, or reload the model.';
			return;
		}
		result = matched.data;
		resultSource = 'ai';
		aiState = 'ready';
	}
	onDestroy(cancel);
</script>

<section class="role-matcher" aria-label="Match a role to Hunter’s experience">
	<div class="match-entry">
		<p class="eyebrow"><Sparkles size={13} /> A SHORTCUT TO THE RELEVANT PARTS</p>
		<h3>Your role.<br /><span class="serif-accent">My experience.</span></h3>
		<p class="match-intro">
			Paste a job description or tell me what your team needs. Find the connections to work I’ve
			actually done.
		</p>
		<form
			onsubmit={(event) => {
				event.preventDefault();
				void match();
			}}
		>
			<Field.FieldGroup class="gap-3"
				><Field.Field>
					<Field.FieldLabel for="role-description">What are you looking for?</Field.FieldLabel>
					<textarea
						id="role-description"
						class="role-input"
						bind:value={input}
						oninput={() => {
							result = null;
							error = '';
						}}
						maxlength={4000}
						rows="6"
						placeholder="We’re looking for an engineering lead who can build thoughtful AI products and mentor a team…"
						disabled={busy}
						aria-describedby="role-help"></textarea>
					<Field.FieldDescription id="role-help"
						>A role, a challenge, or a few requirements. Up to 4,000 characters.</Field.FieldDescription
					>
				</Field.Field>
				<Button type="submit" disabled={busy || !input.trim()}
					><Sparkles data-icon="inline-start" />{aiState === 'loading'
						? 'Preparing local AI…'
						: aiState === 'working'
							? 'Finding connections…'
							: 'Match this role'}<ArrowRight data-icon="inline-end" /></Button
				>
			</Field.FieldGroup>
		</form>
		{#if consent}
			<div class="download-consent">
				<strong
					>{weightsCached
						? 'Your model weights are already cached.'
						: 'One download. Everything runs here.'}</strong
				>
				<p>
					{#if weightsCached}Load the cached model into GPU memory. Missing configuration or runtime
						files may still be fetched. Your description stays on your device.{:else}
						Enable the free local model: roughly 400 MB plus runtime files, cached in your browser.
						Requires a WebGPU-capable device. Model files download from Hugging Face and MLC; your
						description stays on your device.
					{/if}
				</p>
				<div class="flex flex-wrap gap-2">
					<Button size="sm" onclick={() => match(true)}
						>{weightsCached ? 'Load & match' : 'Download & match'}</Button
					><Button variant="ghost" size="sm" onclick={() => (consent = false)}>Not now</Button>
				</div>
			</div>
		{/if}
		{#if busy}<div class="match-progress" role="status">
				{#if aiState === 'loading'}<progress
						max="100"
						value={progress}
						aria-label="Loading local AI model"
					></progress>
					<p>
						{weightsCached
							? 'Loading cached model into memory'
							: 'Downloading and preparing the model'} · {progress}%.
					</p>{:else}<p>Reading your requirements against the experience provided…</p>{/if}<Button
					variant="ghost"
					size="sm"
					onclick={cancel}>Cancel</Button
				>
			</div>{/if}
		{#if error}<Alert.Root variant="destructive"
				><Alert.Title>Try another way</Alert.Title><Alert.Description>{error}</Alert.Description
				></Alert.Root
			>{#if errorDetails}<details class="match-diagnostics">
					<summary>Technical details</summary>
					<pre>{errorDetails}</pre>
					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							cancel();
							error = '';
							errorDetails = '';
						}}>Reload model</Button
					>
				</details>{/if}{/if}
		<div class="match-examples">
			<p class="tiny-mono">OR TRY AN EXAMPLE — NO DOWNLOAD</p>
			<div>
				{#each roleExamples as example, i (example.label)}<button
						disabled={busy}
						onclick={() => preview(i)}>{example.label}<ArrowUpRight size={12} /></button
					>{/each}
			</div>
		</div>
		<p class="match-privacy">
			No account. No API bill. {ai
				? 'Local AI is ready.'
				: 'AI is optional; the full portfolio is below.'}
		</p>
		<p class="match-privacy" role="status">
			{weightsCached ? 'Model weights cached in this browser.' : cacheMessage}
		</p>
		<details class="model-storage">
			<summary>Model download & storage</summary>
			<p role="status">{cacheMessage}</p>
			{#each cached?.models ?? [] as model, index (index)}<p>
					<strong>{model.name}</strong><br />{model.complete
						? 'All weight files cached'
						: 'Partial weight download'}
				</p>{/each}
			<p>
				Stored by this browser for this site only. Cached weights still need to be loaded into GPU
				memory. Clearing removes all WebLLM model, configuration, and runtime caches here, including
				older or partial downloads.
			</p>
			<div class="flex flex-wrap gap-2">
				<Button variant="outline" size="sm" onclick={refreshCache} disabled={busy || clearing}
					>Refresh status</Button
				><Button variant="outline" size="sm" onclick={clearDownloads} disabled={busy || clearing}
					>{clearing ? 'Clearing…' : 'Clear downloaded models'}</Button
				>
			</div>
		</details>
	</div>
	<div class="match-results" aria-live="polite" aria-busy={busy}>
		{#if result}
			<p class="eyebrow">
				{resultSource === 'example'
					? 'EXAMPLE PREVIEW · NO AI USED'
					: 'LOCAL AI · VERIFY RELEVANCE'}
			</p>
			<h4>{result.matches.length ? 'Here’s where we connect.' : 'No clear connection found.'}</h4>
			<p class="result-note">
				{resultSource === 'example'
					? 'An authored example of what this tool can surface. Edit the description to match your own role.'
					: 'AI selected these possible connections from experience I’ve provided. Sources and links are included where available.'}
			</p>
			{#each result.matches as connection (connection.evidenceId)}
				{@const item = getEvidence(connection.evidenceId)}
				<article class="connection">
					<p class="requirement">YOU’RE LOOKING FOR</p>
					<blockquote>“{connection.requirement}”</blockquote>
					<h5>{item.title}</h5>
					<p>{item.fact}</p>
					{#if item.href}
						<!-- Authored evidence links are page fragments or external URLs, not app routes. -->
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
						<a href={item.href}>{item.source || 'View evidence'}<ArrowUpRight size={13} /></a>
					{:else if item.source}
						<p>{item.source}</p>
					{/if}
				</article>
			{/each}
			{#if result.gaps.length}<div class="match-gaps">
					<h5>Worth discussing</h5>
					<p>
						These requirements aren’t established by the experience provided. That’s a gap in
						evidence, not a claim about ability.
					</p>
					<ul>
						{#each result.gaps as gap (gap)}<li>“{gap}”</li>{/each}
					</ul>
				</div>{/if}
			{#if !result.matches.length}<p class="no-match">
					Try a more specific description, or <a href="#about">explore my background</a> directly.
				</p>{/if}
		{:else}
			<div class="match-empty">
				<span class="match-mark"><ArrowUpRight size={30} /></span>
				<h4>Less searching.<br /><span class="serif-accent">More connection.</span></h4>
				<p>
					Find up to three relevant pieces of experience, with supporting links where available.
				</p>
				<ol>
					<li><span>01</span>Describe the role or team challenge.</li>
					<li><span>02</span>Let local AI find possible connections.</li>
					<li><span>03</span>Follow the evidence. Start a conversation.</li>
				</ol>
				<a class="text-link" href="#case-study">Prefer to read the work? <ArrowRight size={14} /></a
				>
			</div>
		{/if}
	</div>
</section>

<style>
	.model-storage,
	.match-diagnostics {
		font-size: 11px;
		color: var(--muted-foreground);
		line-height: 1.8;
	}
	.model-storage summary,
	.match-diagnostics summary {
		cursor: pointer;
		color: var(--foreground);
	}
	.model-storage p {
		margin: 10px 0;
		overflow-wrap: anywhere;
	}
	.match-diagnostics pre {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		font-size: 10px;
		margin: 10px 0;
	}
	.role-matcher {
		display: grid;
		grid-template-columns: 1fr 1fr;
		border: 1px solid var(--border);
		background: var(--card);
		border-radius: 10px;
		overflow: hidden;
		margin-bottom: 55px;
	}
	.match-entry {
		padding: 34px;
		display: flex;
		flex-direction: column;
		gap: 22px;
	}
	.match-entry > .eyebrow {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.match-entry h3 {
		font-size: 40px;
		line-height: 1.05;
		letter-spacing: -0.05em;
		font-weight: 450;
	}
	.match-intro {
		font-size: 13px;
		line-height: 1.8;
		color: var(--muted-foreground);
	}
	.role-input {
		width: 100%;
		resize: vertical;
		min-height: 150px;
		padding: 13px;
		border: 1px solid var(--input);
		border-radius: 5px;
		font: inherit;
		font-size: 13px;
		line-height: 1.7;
		background: var(--background);
		color: var(--foreground);
	}
	.role-input::placeholder {
		color: var(--muted-foreground);
	}
	.role-input:focus-visible {
		outline: 2px solid var(--primary);
		outline-offset: 3px;
	}
	.role-input:disabled {
		opacity: 0.65;
	}
	.download-consent,
	.match-gaps {
		padding: 18px;
		background: var(--secondary);
		border: 1px solid var(--border);
		border-radius: 5px;
	}
	.download-consent strong,
	.match-gaps h5 {
		font-size: 13px;
		font-weight: 550;
	}
	.download-consent p,
	.match-gaps p {
		font-size: 11px;
		line-height: 1.8;
		color: var(--muted-foreground);
		margin: 9px 0 15px;
	}
	.match-examples > div {
		display: flex;
		flex-wrap: wrap;
		gap: 7px;
		margin-top: 10px;
	}
	.match-examples button {
		display: inline-flex;
		gap: 8px;
		align-items: center;
		border: 1px solid var(--border);
		border-radius: 20px;
		padding: 8px 10px;
		font-size: 10px;
		cursor: pointer;
	}
	.match-examples button:hover {
		background: var(--accent);
	}
	.match-examples button:disabled {
		cursor: wait;
		opacity: 0.5;
	}
	.match-privacy {
		font-size: 10px;
		color: var(--muted-foreground);
		line-height: 1.8;
	}
	.match-results {
		padding: 34px;
		background: var(--secondary);
		border-left: 1px solid var(--border);
		min-width: 0;
	}
	.match-results h4 {
		font-size: 26px;
		letter-spacing: -0.04em;
		margin-top: 12px;
		line-height: 1.2;
	}
	.result-note {
		font-size: 11px;
		line-height: 1.8;
		color: var(--muted-foreground);
		margin-top: 12px;
	}
	.connection {
		padding: 23px 0;
		border-bottom: 1px solid var(--border);
		overflow-wrap: anywhere;
	}
	.requirement {
		font: 8px var(--font-mono);
		letter-spacing: 0.09em;
		color: var(--muted-foreground);
	}
	.connection blockquote {
		font:
			italic 18px/1.5 Georgia,
			serif;
		margin: 7px 0 14px;
		color: var(--primary);
	}
	.connection h5 {
		font-size: 13px;
		font-weight: 550;
		margin-bottom: 8px;
	}
	.connection > p:not(.requirement) {
		font-size: 12px;
		line-height: 1.85;
		color: var(--muted-foreground);
	}
	.connection a {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		color: var(--primary);
		font-size: 10px;
		margin-top: 12px;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.match-gaps {
		margin-top: 22px;
		background: var(--card);
	}
	.match-gaps ul {
		padding-left: 18px;
		list-style: disc;
		font-size: 12px;
		line-height: 1.8;
		overflow-wrap: anywhere;
	}
	.match-empty {
		min-height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 15px 5px;
	}
	.match-mark {
		display: grid;
		place-items: center;
		width: 62px;
		height: 62px;
		border: 1px solid var(--input);
		border-radius: 50%;
		color: var(--primary);
		margin-bottom: 25px;
	}
	.match-empty h4 {
		font-size: 34px;
		font-weight: 450;
	}
	.match-empty > p {
		font-size: 13px;
		color: var(--muted-foreground);
		line-height: 1.8;
		max-width: 300px;
		margin-top: 18px;
	}
	.match-empty ol {
		display: flex;
		flex-direction: column;
		gap: 18px;
		margin: 30px 0 20px;
		font-size: 11px;
	}
	.match-empty li span {
		font: 9px var(--font-mono);
		color: var(--primary);
		margin-right: 10px;
	}
	.match-progress p,
	.no-match {
		font-size: 12px;
		line-height: 1.8;
	}
	.no-match {
		margin-top: 20px;
	}
	.no-match a {
		text-decoration: underline;
	}
	progress {
		width: 100%;
		height: 5px;
		accent-color: var(--primary);
	}
	@media (max-width: 760px) {
		.role-matcher {
			grid-template-columns: 1fr;
		}
		.match-entry,
		.match-results {
			padding: 25px;
		}
		.match-results {
			border-left: 0;
			border-top: 1px solid var(--border);
		}
		.match-empty {
			padding: 5px;
		}
		.match-mark {
			display: none;
		}
		.match-empty h4 {
			font-size: 28px;
		}
	}
	@media (max-width: 400px) {
		.match-entry,
		.match-results {
			padding: 20px;
		}
	}
</style>
