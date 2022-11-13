<script lang="ts">
	import ImageGallery from '$lib/ImageGallery.svelte'
	import Root from '$lib/Root.svelte'
	import ProjectCard from '$lib/ProjectCard.svelte'
	import Note from '$lib/Note.svelte'
</script>

<main>
	<Root>
		<ImageGallery>
			<Note>
				Hello and welcome to Joppe Koers' website. This is where you'll find my portfolio, personal projects and
				a mix of programming related stuff. Since I can remember I've always wanted to make stuff. To accomplish
				this I acquired a number of skills of which you can see the result below. Do you want me to make you
				something? See the projects below to see what I'm capable of. You can contact me form the
				<a href="/contact" class="internalLink">/contact</a> page.
			</Note>
			<ProjectCard id="wolmolen" />
			<ProjectCard id="hammer" />
			<ProjectCard id="arcade-machine" />
			<ProjectCard id="small-box" />
			<ProjectCard id="matrix" />
			<ProjectCard id="audio-cart-storage" />
			<ProjectCard id="audio-cart-storage-2" />
			<ProjectCard id="door-frame" />
			<ProjectCard id="wooden-storage-sofa" />
			<ProjectCard id="table-legs" />
			<ProjectCard id="speakers" />
			<ProjectCard id="sword" />
			<ProjectCard id="sword2" />
			<ProjectCard id="rainbarrel-stand" />
			<ProjectCard id="table" />
			<ProjectCard id="big-hammer" />
			<ProjectCard id="knife" />
			<ProjectCard id="jacob-s-ladder" />
			<ProjectCard id="boom-mic-stand" />
			<ProjectCard id="cork-screw" />
			<ProjectCard id="electric-car" />
			<ProjectCard id="electric-kettle" />
			<ProjectCard id="greenhouse" />
			<ProjectCard id="lab-power-supply" />
			<ProjectCard id="raid-server" />
			<ProjectCard id="rattan-doors" />
			<ProjectCard id="rpi-remote-backup" />
			<ProjectCard id="screwdriver-holder" />
			<ProjectCard id="small-car" />
			<ProjectCard id="suskast" />
			<ProjectCard id="wheel-respoke" />
			<ProjectCard id="wheel-respoke-2" />
		</ImageGallery>
	</Root>
</main>

<style>
	.internalLink {
		text-decoration: underline;
		color: black;
	}
</style>
