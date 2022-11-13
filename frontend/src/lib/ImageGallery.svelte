<!-- From: https://github.com/berkinakkaya/svelte-image-gallery#readme -->
<script lang="ts">
	import { onMount, tick } from 'svelte'

	export let gap = 10
	export let maxColumnWidth = 300

	let slotHolder: HTMLDivElement | null = null
	let delivery: HTMLDivElement | null = null

	let galleryWidth = 0
	let columnCount = 0
	let columns: (HTMLDivElement | null)[] = []

	$: columnCount = Math.floor(galleryWidth / maxColumnWidth) || 1
	$: columnCount && draw()
	$: galleryStyle = `grid-template-columns: repeat(${columnCount}, 1fr); --gap: ${gap}px`

	async function draw() {
		await tick()
		if (!slotHolder) return

		columns = Array(columnCount).fill(null)
		await tick() // waiting for colums to be created

		console.log(window.innerWidth, galleryWidth, columnCount)
		// Fill the columns with image URLs
		for (const [i, node] of slotHolder.childNodes.entries()) {
			const column = i % columnCount
			columns[column].appendChild(node)
		}
	}

	onMount(async () => {
		await draw()
	})
</script>

<div id="imported" bind:this={slotHolder}>
	<slot />
</div>

<div id="gallery" bind:clientWidth={galleryWidth} style={galleryStyle} bind:this={delivery}>
	{#each columns as _, i}
		<div class="column" bind:this={columns[i]} />
	{/each}
</div>

<style>
	#imported {
		display: none;
	}

	#gallery {
		width: 100%;
		display: grid;
		gap: var(--gap);
	}
	#gallery .column {
		display: flex;
		flex-direction: column;
	}
	#gallery .column * {
		width: 100%;
		margin-top: var(--gap);
	}
	#gallery .column *:nth-child(1) {
		margin-top: 0;
	}
</style>
