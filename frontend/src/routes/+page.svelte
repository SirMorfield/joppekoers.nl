<script lang="ts">
	import ImageGallery from '$lib/ImageGallery.svelte'
	import Root from '$lib/Root.svelte'
	import ProjectCard from '$lib/ProjectCard.svelte'
	import Note from '$lib/Note.svelte'
	import type { PageData } from './$types'

	export let data: PageData
</script>

<Root>
	<ImageGallery>
		<Note>
			Hello and welcome to Joppe Koers' website. This is where you'll find my portfolio, personal projects and a
			mix of programming related stuff. Since I can remember I've always wanted to make stuff. To accomplish this
			I acquired a number of skills of which you can see the result below. Do you want me to make you something?
			See the projects below to see what I'm capable of. You can contact me form the
			<a href="/contact" class="internalLink">/contact</a> page.
		</Note>

		{#each data.projects as project}
			<ProjectCard {project} />
		{/each}
	</ImageGallery>
</Root>
