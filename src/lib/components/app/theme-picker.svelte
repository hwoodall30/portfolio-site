<script lang="ts">
	import { onMount } from 'svelte';
	import { attempt } from '#lib/helpers/attempt.js';

	let theme = $state('system');
	let storageMessage = $state('');

	function applyTheme() {
		document.documentElement.dataset.theme = theme;
		document.documentElement.classList.toggle(
			'dark',
			theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
		);
	}

	function saveTheme() {
		applyTheme();
		const saved = attempt<string, void>(() => localStorage.setItem('portfolio-theme', theme));
		storageMessage =
			saved.error !== null ? 'Theme applied for this visit. Browser storage is unavailable.' : '';
	}

	onMount(() => {
		theme = document.documentElement.dataset.theme ?? 'system';
		const system = matchMedia('(prefers-color-scheme: dark)');
		system.addEventListener('change', applyTheme);
		return () => system.removeEventListener('change', applyTheme);
	});
</script>

<div class="theme-picker">
	<label for="site-theme" class="sr-only">Color theme</label>
	<select id="site-theme" bind:value={theme} onchange={saveTheme}>
		<option value="system">System</option>
		<option value="light">Light</option>
		<option value="dark">Dark</option>
	</select>
	<span class="sr-only" role="status">{storageMessage}</span>
</div>

<style>
	select {
		min-height: 44px;
		border: 1px solid var(--input);
		border-radius: var(--radius);
		background-color: var(--card);
		color: var(--foreground);
		font: 11px var(--font-mono);
		padding: 8px 30px 8px 12px;
		cursor: pointer;
	}
	select:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 3px;
	}
</style>
