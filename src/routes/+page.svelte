<script lang="ts">
	import PortfolioPage from './_components/portfolio-page.svelte';
</script>

<svelte:head>
	<title>Hunter Woodall — Software Engineer</title>
	<meta
		name="description"
		content="Hunter Woodall, lead software engineer. Work in product discovery, frontend development, AI, and engineering leadership."
	/>
	<meta name="theme-color" content="#f6f5f0" />
	<meta property="og:title" content="Hunter Woodall — Software Engineer" />
	<meta
		property="og:description"
		content="A few projects, my engineering background, and a way to compare your role with my experience."
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
