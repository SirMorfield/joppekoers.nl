<!-- From: https://github.com/berkinakkaya/svelte-image-gallery#readme -->
<script lang="ts">
	import { onMount } from 'svelte'
	import 'photoswipe/style.css'
	import type { ProjectExport } from '@shared/types'
	import PhotoSwipe from 'photoswipe'

	export let gap = 10
	export let maxColumnWidth = 250
	export let projects: ProjectExport[]

	let galleryWidth = 0
	let columnCount = 0
	let columns: ProjectExport[][] = []

	$: columnCount = Math.floor(galleryWidth / maxColumnWidth) || 1
	$: columnCount && draw()
	$: galleryStyle = `grid-template-columns: repeat(${columnCount}, 1fr); --gap: ${gap}px`

	onMount(draw)
	function draw() {
		// const imagesx = Array.from(slotHolder.childNodes).filter((child) => child.tagName === 'IMG')
		columns = []

		// Fill the columns with image URLs
		for (const [i, project] of projects.entries()) {
			const column = i % columnCount
			if (!columns[column]) columns[column] = []

			columns[column].push(project)
		}
	}

	function openPhotoSwhipe(id: string) {
		const { imgs } = projects.find((p) => p.id === id)

		const gallery = new PhotoSwipe({
			gallery: '#pswp-gallery-id',
			dataSource: imgs,
			pswpModule: () => import('photoswipe'),
			loop: false,
			bgOpacity: 0.9,
			showAnimationDuration: 100,
			hideAnimationDuration: 100,
			pinchToClose: false,
		})
		gallery.init()
	}
</script>

<div id="gallery" bind:clientWidth={galleryWidth} style={galleryStyle}>
	{#each columns as column}
		<div class="column">
			{#each column as project}
				<img
					src={project.thumbnail.src}
					alt={project.thumbnail.alt}
					on:click={() => openPhotoSwhipe(project.id)}
					on:keydown={() => {}}
					class="img-hover"
					loading="lazy"
				/>
			{/each}
		</div>
	{/each}
</div>

<div class="pswp-gallery" id="pswp-gallery-id" />

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
		border-radius: 3px;
		transition: all 0.1s;
	}
	.img-hover:hover {
		opacity: 1;
		transform: scale(1.04);
		cursor: pointer;
	}
	.pswp-gallery {
		display: none;
	}
</style>
