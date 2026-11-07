<script lang="ts">
	import PortfolioPage from './_components/portfolio-page.svelte';
</script>

<svelte:head>
	<title>Hunter Woodall — Engineering thoughtful products</title>
	<meta
		name="description"
		content="Hunter Woodall is a lead software engineer turning complex problems into useful products. Explore engineering leadership, frontend craft, and human-centered AI."
	/>
	<meta name="theme-color" content="#f6f5f0" />
	<meta property="og:title" content="Hunter Woodall — Engineering thoughtful products" />
	<meta
		property="og:description"
		content="Engineering leadership, frontend craft, and AI with a human in control. Find the experience relevant to your team."
	/>
</svelte:head>

<svelte:boundary>
	<PortfolioPage />
	{#snippet failed(error, reset)}
		<main class="page-error">
			<h1>Something didn’t load.</h1>
			<p>Please try loading the portfolio again.</p>
			<button onclick={reset}>Try again</button><a href="mailto:hwoodall30@gmail.com"
				>Email Hunter</a
			>
		</main>
	{/snippet}
</svelte:boundary>
