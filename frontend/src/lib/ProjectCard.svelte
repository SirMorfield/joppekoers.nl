<script lang="ts">
	export let project: Project

	import 'photoswipe/style.css'
	import PhotoSwipe from 'photoswipe'
	import type { Project } from '$root/server/cms'
	import Img from '@zerodevx/svelte-img'

	function openPhotoSwhipe() {
		const gallery = new PhotoSwipe({
			gallery: '#pswp-gallery-id',
			dataSource: project.content.map(c => c[0]), // TODO: use srcset
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
<div class="h-auto w-full rounded-lg" on:keydown={() => null} on:click={() => openPhotoSwhipe()}>
	<!-- TODO: better alt-->
	<Img src={project.header} alt={project.header[0].alt} />
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
