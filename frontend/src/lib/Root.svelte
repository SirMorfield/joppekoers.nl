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
	<div>
		<slot />
	</div>
	<div>Built, hosted and maintained by Joppe Koers</div>
</div>

<style>
	:root {
		all: revert;

		font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
		font-size: 16px;
		line-height: 24px;
		font-weight: 400;
		margin: 0;

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
		min-height: 93vh;
		max-height: 93vh;
		width: 99%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		max-width: 1600px;
		margin: 0 auto;
	}
</style>
