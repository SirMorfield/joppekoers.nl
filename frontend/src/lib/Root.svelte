<script lang="ts">
	import Header from '$lib/Header.svelte'
	// const title = process?.env['NODE_ENV'] === 'development' ? 'DEV' : 'Joppe Koers.nl'
</script>

<svelte:head>
	<title>Joppe Koers.nl</title>
	<meta name="description" content="This is a webside build, hosted and maintained by Joppe Koers" />
	<meta name="keywords" content="Joppe, Koers, J.E. Koers, Portfolio, joppe@joppekoers.nl, 73820857" />
	<meta name="author" content="Joppe Koers" />
</svelte:head>

<div id="root">
	<Header />
	<div id="imported">
		<slot />
	</div>
	<!-- <div>Built, hosted and maintained by Joppe Koers</div> -->
</div>

<style>
	/* devanagari */
	@font-face {
		font-family: 'Kadwa';
		font-style: normal;
		font-weight: 400;
		font-display: swap;
		src: url(/fonts/kadwa-devanagari.woff2) format('woff2');
		unicode-range: U+0900-097F, U+1CD0-1CF6, U+1CF8-1CF9, U+200C-200D, U+20A8, U+20B9, U+25CC, U+A830-A839,
			U+A8E0-A8FB;
	}
	/* latin */
	@font-face {
		font-family: 'Kadwa';
		font-style: normal;
		font-weight: 400;
		font-display: swap;
		src: url(/fonts/kadwa-latin.woff2) format('woff2');
		unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074,
			U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
	}

	:root {
		all: revert;

		font-family: Kadwa, Arial, sans-serif;
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
		width: 100%;
		max-width: 1300px;
		padding: 10px;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		margin: 0 auto;
	}
	#imported {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
	}

	#root * {
		max-width: 100%;
	}
</style>
