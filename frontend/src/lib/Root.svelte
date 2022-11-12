<script lang="ts">
	import Header from '$lib/Header.svelte'
	// const title = process?.env['NODE_ENV'] === 'development' ? 'DEV' : 'Joppe Koers.nl'
</script>

<svelte:head>
	<title>DEV</title>
	<meta name="description" content="This is a webside build, hosted and maintained by Joppe Koers" />
	<meta name="keywords" content="Joppe, Koers, J.E. Koers, Portfolio, joppe@joppekoers.nl, 73820857" />
	<meta name="author" content="Joppe Koers" />
</svelte:head>

<div id="root">
	<Header />
	<slot />
</div>

<style>
	:root {
		font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
		font-size: 16px;
		line-height: 24px;
		font-weight: 400;

		color-scheme: dark;
		color: rgba(255, 255, 255, 0.87);
		background-color: #242424;

		font-synthesis: none;
		text-rendering: optimizeLegibility;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		-webkit-text-size-adjust: 100%;
	}

	#root {
		width: 99%;
		/* width: 1000px; */
		max-width: 1600px;
		margin: 0 auto;
	}
</style>
