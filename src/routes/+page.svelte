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
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://portfolio.woodallstack.dev/" />
	<meta property="og:site_name" content="Hunter Woodall" />
	<meta property="og:image" content="https://portfolio.woodallstack.dev/hw-preview.png" />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta
		property="og:image:alt"
		content="Orange hw. monogram above Hunter Woodall — Software engineer, building AI products."
	/>
	<meta property="og:video" content="https://portfolio.woodallstack.dev/hw-preview.mp4" />
	<meta property="og:video:type" content="video/mp4" />
	<meta property="og:video:width" content="1200" />
	<meta property="og:video:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Hunter Woodall — Software Engineer" />
	<meta name="twitter:image" content="https://portfolio.woodallstack.dev/hw-preview.png" />
	<meta
		name="twitter:image:alt"
		content="Orange hw. monogram above Hunter Woodall — Software engineer, building AI products."
	/>
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
