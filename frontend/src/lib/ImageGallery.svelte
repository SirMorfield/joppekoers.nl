<!-- From: https://github.com/berkinakkaya/svelte-image-gallery#readme -->
<script lang="ts">
	import { onMount } from 'svelte'
	import 'photoswipe/style.css'
	import type { ImageExport, ProjectExport } from '@shared/types'

	export let gap = 10
	export let maxColumnWidth = 250
	export let projects: ProjectExport[]
	let galleryWidth = 0
	let columnCount = 0

	$: columnCount = Math.floor(galleryWidth / maxColumnWidth) || 1
	$: columnCount && draw()
	$: galleryStyle = `grid-template-columns: repeat(${columnCount}, 1fr); --gap: ${gap}px`

	onMount(draw)
	let columns: ImageExport[][] = []
	function draw() {
		// const imagesx = Array.from(slotHolder.childNodes).filter((child) => child.tagName === 'IMG')
		columns = []

		// Fill the columns with image URLs
		for (const [i, project] of projects.entries()) {
			const column = i % columnCount
			if (!columns[column]) columns[column] = []

			columns[column].push(project.thumbnail)
		}
		console.log('draw', columns.length)
	}
</script>

<div id="gallery" bind:clientWidth={galleryWidth} style={galleryStyle}>
	{#each columns as column}
		<div class="column">
			{#each column as img}
				<img src={img.src} alt="" on:click={() => {}} on:keydown={() => {}} class="img-hover" loading="lazy" />
			{/each}
		</div>
	{/each}
</div>

<!-- <div class="pswp-gallery" id={galleryID} bind:clientWidth={galleryWidth} style={galleryStyle} /> -->
<style>
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
	.img-hover {
		transition: all 0.1s;
	}
	.img-hover:hover {
		opacity: 1;
		transform: scale(1.04);
		cursor: pointer;
	}
</style>
