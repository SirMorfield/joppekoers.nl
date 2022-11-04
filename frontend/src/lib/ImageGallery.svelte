<!-- From: https://github.com/berkinakkaya/svelte-image-gallery#readme -->
<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte'
	import PhotoSwipeLightbox from 'photoswipe/lightbox'
	import 'photoswipe/style.css'

	export let gap = 10
	export let maxColumnWidth = 250
	export let hover = false
	export let loading = 'lazy'

	export let galleryID = 'gallery'

	interface Project {
		imgs: { src: string; w: number; h: number }[]
		root: string
	}
	export let projects: Project[]

	onMount(() => {
		let lightbox = new PhotoSwipeLightbox({
			gallery: '#' + galleryID,
			children: 'a',
			pswpModule: () => import('photoswipe'),
		})
		lightbox.init()
	})

	const dispatch = createEventDispatcher()

	let columns = []
	let galleryWidth = 0
	let columnCount = 0

	$: columnCount = Math.floor(galleryWidth / maxColumnWidth) || 1
	$: columnCount && Draw()
	$: galleryStyle = `grid-template-columns: repeat(${columnCount}, 1fr); --gap: ${gap}px`

	onMount(Draw)

	function HandleClick(e) {
		dispatch('click', {
			src: e.target.src,
			alt: e.target.alt,
			loading: e.target.loading,
			class: e.target.className,
		})
	}

	async function Draw() {
		// const imagesx = Array.from(slotHolder.childNodes).filter((child) => child.tagName === 'IMG')
		columns = []

		// Fill the columns with image URLs
		for (let i = 0; i < projects.length; i++) {
			const idx = i % columnCount
			columns[idx] = [...(columns[idx] || []), { src: projects[i].imgs[0]!.src, alt: '', class: '' }] // todo
		}
	}
	Draw()
</script>

<div class="pswp-gallery" id={galleryID} bind:clientWidth={galleryWidth} style={galleryStyle}>
	{#each columns as column}
		<div class="column">
			{#each column as img}
				<a href={img.src} data-pswp-width={img.w} data-pswp-height={img.h} target="_blank" rel="noreferrer">
					<img
						src={img.src}
						alt={img.alt}
						on:click={HandleClick}
						on:keydown={() => {}}
						class="{hover === true ? 'img-hover' : ''} {img.class}"
						{loading}
					/>
				</a>
			{/each}
		</div>
	{/each}
</div>

<style>
	#slotHolder {
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
	.img-hover {
		transition: all 0.1s;
	}
	.img-hover:hover {
		opacity: 1;
		transform: scale(1.04);
	}
</style>
