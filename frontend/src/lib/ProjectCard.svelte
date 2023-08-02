<script lang="ts">
	export let project: Project

	import 'photoswipe/style.css'
	import PhotoSwipe from 'photoswipe'
	import type { ImageSource, Project } from '$root/server/cms'
	import Img from '@zerodevx/svelte-img'

	function toDataSource({ srcset, alt, formats }: ImageSource) {
		return {
			srcset,
			alt,
			src: formats[0].src, // choosing a random start image, srcset will take care of the rest
			width: formats[0].width,
			height: formats[0].height,
		}
	}

	function openPhotoSwhipe() {
		const gallery = new PhotoSwipe({
			gallery: '#pswp-gallery-id',
			dataSource: project.content.map(toDataSource),
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

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:keydown={() => null} on:click={() => openPhotoSwhipe()}>
	<Img class="h-auto w-full rounded-lg project" src={project.header.formats} alt={project.header.alt} />
</div>

<style>
	div {
		transition: all 0.08s ease-in-out;
	}
	div:hover {
		cursor: pointer;
		transform: scale(1.04);
	}
</style>
