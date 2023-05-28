<!-- From: https://github.com/berkinakkaya/svelte-image-gallery#readme -->
<script lang="ts">
	import { onMount, tick } from 'svelte'

	export let gap = 10
	export const maxColumnCount = 4
	export const maxColumnWidth = 300

	let slotHolder: HTMLDivElement | undefined = undefined
	const columns: (HTMLDivElement | undefined)[] = Array(maxColumnCount)

	let galleryWidth = 0
	let previousGalleryWidth = galleryWidth + 1 // force draw on mount
	let galleryStyle = ''

	$: columnCount = Math.min(Math.floor(galleryWidth / maxColumnWidth) || 1, maxColumnCount)
	$: columnCount && draw()
	$: galleryStyle = `grid-template-columns: repeat(${columnCount}, 1fr); --gap: ${gap}px`

	async function draw() {
		await tick()
		if (!slotHolder) return
		if (previousGalleryWidth === galleryWidth) return

		let found = false
		do {
			found = false
			for (const column of columns) {
				if (column.firstElementChild) {
					slotHolder.appendChild(column.firstElementChild)
					found = true
				}
			}
		} while (found)

		let i = 0
		while (slotHolder.firstElementChild) {
			const column = i++ % columnCount
			columns[column].appendChild(slotHolder.firstElementChild)
		}
		previousGalleryWidth = galleryWidth
	}

	onMount(async () => {
		await draw()
	})
</script>

<div id="imported" bind:this={slotHolder}>
	<slot />
</div>

<div id="gallery" bind:clientWidth={galleryWidth} style={galleryStyle}>
	{#each columns as column}
		<div class="column" bind:this={column} />
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
		gap: var(--gap);
	}

	#gallery .column * {
		width: 100%;
	}

	#gallery .column *:nth-child(1) {
		margin-top: 0;
	}
</style>
