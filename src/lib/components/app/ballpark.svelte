<script lang="ts">
	import { onMount } from 'svelte';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import RotateCw from '@lucide/svelte/icons/rotate-cw';
	import { Button } from '#lib/components/ui/button/index.js';
	import { attempt } from '#lib/helpers/attempt.js';
	import type { createBallpark } from '#lib/ballpark/scene.js';
	let { class: className = '' }: { class?: string } = $props();
	let host: HTMLDivElement;
	let scene = $state<ReturnType<typeof createBallpark> | null>(null);
	let failed = $state(false);
	onMount(() => {
		let disposed = false;
		async function initialize() {
			const result = await attempt<string, ReturnType<typeof createBallpark>>(async () => {
				const { createBallpark } = await import('#lib/ballpark/scene.js');
				if (disposed) throw new Error('Unmounted');
				return createBallpark(host);
			});
			if (disposed) {
				if (result.error === null) result.data.dispose();
				return;
			}
			if (result.error !== null) failed = true;
			else scene = result.data;
		}
		void initialize();
		return () => {
			disposed = true;
			scene?.dispose();
		};
	});
</script>

<div class="ballpark-view {className}">
	<div class="scene-host" bind:this={host}></div>
	{#if !scene}
		<div class="park-fallback" role="img" aria-label="Overhead baseball diamond">
			<svg viewBox="0 0 400 300" aria-hidden="true"
				><path
					d="M200 255 40 95 Q200 -40 360 95Z"
					fill="#38674e"
					stroke="#c9c8b7"
					stroke-width="22"
				/><path d="m200 245-67-67 67-67 67 67Z" fill="#c49a75" /><path
					d="m200 218-40-40 40-40 40 40Z"
					fill="#5a8966"
				/><path d="M200 245 55 99M200 245 345 99" stroke="#f2ecdb" stroke-width="2" /></svg
			>
			<span>{failed ? '3D unavailable · overview mode' : 'Preparing the ballpark…'}</span>
		</div>
	{/if}
	{#if scene}
		<div class="scene-controls" aria-label="Rotate ballpark">
			<Button
				variant="ghost"
				size="icon-sm"
				aria-label="Rotate ballpark left"
				onclick={() => scene?.rotate(-1)}><RotateCcw /></Button
			>
			<span>DRAG TO ROTATE</span>
			<Button
				variant="ghost"
				size="icon-sm"
				aria-label="Rotate ballpark right"
				onclick={() => scene?.rotate(1)}><RotateCw /></Button
			>
		</div>
	{/if}
</div>

<style>
	.ballpark-view {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 300px;
	}
	.scene-host {
		width: 100%;
		height: 100%;
		position: absolute;
		inset: 0;
	}
	.scene-host :global(canvas) {
		display: block;
		width: 100%;
		height: 100%;
	}
	.scene-controls {
		position: absolute;
		bottom: 9px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 12px;
		white-space: nowrap;
	}
	.scene-controls span {
		font: 9px var(--font-mono);
		letter-spacing: 0.13em;
		color: var(--muted-foreground);
	}
	.park-fallback {
		position: absolute;
		inset: 15%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}
	.park-fallback svg {
		width: 100%;
		max-height: 85%;
	}
	.park-fallback span {
		font: 10px var(--font-mono);
		color: var(--muted-foreground);
	}
</style>
