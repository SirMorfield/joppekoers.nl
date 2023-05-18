<!-- From: https://github.com/berkinakkaya/svelte-image-gallery#readme -->
<script lang="ts">
	import { onMount } from 'svelte'

	export let gap = 10
	export const maxColumnCount = 4
	export const maxColumnWidth = 300

	const shownColumStyle = `display: flex; flex-direction: column; gap: ${gap}px`
	const hiddenColumStyle = 'width: 0px; display: none'

	let slotHolder: HTMLDivElement | undefined = undefined
	const columns: (HTMLDivElement | undefined)[] = Array(maxColumnCount)
	const columnStyles: string[] = Array(maxColumnCount).fill(shownColumStyle)

	let galleryWidth = 0
	let galleryStyle = ''

	$: columnCount = Math.floor(galleryWidth / maxColumnWidth) || 1
	$: columnCount && draw()
	$: galleryStyle = `grid-template-columns: repeat(${columnCount}, 1fr); --gap: ${gap}px`

	async function draw() {
		if (!slotHolder) return

		let i = 0
		for (const node of slotHolder.childNodes) {
			if (!(node instanceof HTMLElement)) continue
			const column = i++ % columns.length
			columns[column].appendChild(node)
		}
	}

	onMount(async () => {
		await draw()
		setTimeout(() => {
			galleryStyle = `grid-template-columns: repeat(${columns.length - 1}, 1fr); --gap: ${gap}px`
			columnStyles[columns.length - 1] = hiddenColumStyle
		}, 500)
	})
</script>

<div id="imported" bind:this={slotHolder}>
	<slot />
</div>

<div id="gallery" bind:clientWidth={galleryWidth} style={galleryStyle}>
	{#each columns as column, i}
		<div class="column" bind:this={column} style={columnStyles[i]} />
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

	#gallery .column * {
		width: 100%;
	}

	#gallery .column *:nth-child(1) {
		margin-top: 0;
	}
</style>
