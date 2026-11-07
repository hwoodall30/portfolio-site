<script lang="ts">
	import { onMount } from 'svelte';
	import Monitor from '@lucide/svelte/icons/monitor';
	import { Button } from '#lib/components/ui/button/index.js';
	import { attempt } from '#lib/helpers/attempt.js';

	type Theme = 'system' | 'light' | 'dark';
	const maskId = $props.id();
	let theme = $state<Theme>('system');
	let isDark = $state(false);
	let storageMessage = $state('');

	function applyTheme() {
		isDark =
			theme === 'dark' ||
			(theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
		document.documentElement.dataset.theme = theme;
		document.documentElement.classList.toggle('dark', isDark);
	}

	function setTheme(next: Theme) {
		theme = next;
		applyTheme();
		const saved = attempt<string, void>(() => localStorage.setItem('portfolio-theme', theme));
		storageMessage =
			saved.error !== null ? 'Theme applied for this visit. Browser storage is unavailable.' : '';
	}

	onMount(() => {
		const saved = document.documentElement.dataset.theme;
		theme = saved === 'light' || saved === 'dark' ? saved : 'system';
		applyTheme();
		const system = matchMedia('(prefers-color-scheme: dark)');
		system.addEventListener('change', applyTheme);
		return () => system.removeEventListener('change', applyTheme);
	});
</script>

<div class="theme-picker" role="group" aria-label="Color theme">
	<Button
		variant="outline"
		size="icon"
		class="size-11"
		aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
		title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
		onclick={() => setTheme(isDark ? 'light' : 'dark')}
	>
		<span class="theme-glyph" aria-hidden="true">
			<svg viewBox="0 0 24 24" fill="none">
				<defs>
					<mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
						<rect width="24" height="24" fill="white" />
						<circle class="moon-cutout" cx="25" cy="0" r="6" fill="black" />
					</mask>
				</defs>
				<circle
					class="sun-moon"
					cx="12"
					cy="12"
					r="4.5"
					fill="currentColor"
					mask={`url(#${maskId})`}
				/>
				<g class="sun-rays" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
					<path
						d="M12 1.5v2M12 20.5v2M1.5 12h2M20.5 12h2M4.6 4.6 6 6M18 18l1.4 1.4M4.6 19.4 6 18M18 6l1.4-1.4"
					/>
				</g>
			</svg>
		</span>
	</Button>
	<Button
		variant={theme === 'system' ? 'secondary' : 'ghost'}
		size="sm"
		class="min-h-11"
		aria-label="Use system theme"
		aria-pressed={theme === 'system'}
		title="Follow your device’s light or dark appearance"
		onclick={() => setTheme('system')}
	>
		<Monitor data-icon="inline-start" />System
	</Button>
	<span class="sr-only" role="status">{storageMessage}</span>
</div>

<style>
	.theme-picker {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.theme-glyph {
		display: grid;
		place-items: center;
		color: var(--primary);
	}
	.theme-glyph svg {
		width: 22px;
		height: 22px;
	}
	.sun-moon {
		transform-origin: center;
		transition: r 450ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.moon-cutout {
		transition: transform 450ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.sun-rays {
		transform-origin: center;
		transition:
			transform 450ms cubic-bezier(0.2, 0.8, 0.2, 1),
			opacity 200ms ease;
	}
	:global(.dark) .sun-moon {
		r: 8px;
	}
	:global(.dark) .moon-cutout {
		transform: translate(-8px, 8px);
	}
	:global(.dark) .sun-rays {
		transform: rotate(90deg) scale(0.6);
		opacity: 0;
	}
	@media (prefers-reduced-motion: reduce) {
		.sun-moon,
		.moon-cutout,
		.sun-rays {
			transition: none;
		}
	}
</style>
