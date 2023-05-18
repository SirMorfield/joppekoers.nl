<script>
	import Note from '$lib/Note.svelte'
	import ProjectCard from '$lib/ProjectCard.svelte'
</script>

<!-- From: https://github.com/berkinakkaya/svelte-image-gallery#readme -->

<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
	<div class="grid gap-4 content-start">
		<Note>
			Hello and welcome to Joppe Koers' website. This is where you'll find my portfolio, personal projects and a
			mix of programming related stuff. Since I can remember I've always wanted to make stuff. To accomplish this
			I acquired a number of skills of which you can see the result below. Do you want me to make you something?
			See the projects below to see what I'm capable of. You can contact me form the
			<a href="/contact" class="internalLink">/contact</a> page.
		</Note>
		<ProjectCard id="small-box" />
		<ProjectCard id="door-frame" />
		<ProjectCard id="sword" />
		<ProjectCard id="big-hammer" />
		<ProjectCard id="cork-screw" />
		<ProjectCard id="lab-power-supply" />
		<ProjectCard id="screwdriver-holder" />
		<ProjectCard id="wheel-respoke-2" />
	</div>
	<div class="grid gap-4 content-start">
		<ProjectCard id="wolmolen" />
		<ProjectCard id="matrix" />
		<ProjectCard id="wooden-storage-sofa" />
		<ProjectCard id="sword2" />
		<ProjectCard id="knife" />
		<ProjectCard id="electric-car" />
		<ProjectCard id="raid-server" />
		<ProjectCard id="small-car" />
	</div>
	<div class="grid gap-4 content-start">
		<ProjectCard id="hammer" />
		<ProjectCard id="audio-cart-storage" />
		<ProjectCard id="table-legs" />
		<ProjectCard id="rainbarrel-stand" />
		<ProjectCard id="jacob-s-ladder" />
		<ProjectCard id="electric-kettle" />
		<ProjectCard id="rattan-doors" />
		<ProjectCard id="suskast" />
	</div>
	<div class="grid gap-4 content-start">
		<ProjectCard id="arcade-machine" />
		<ProjectCard id="audio-cart-storage-2" />
		<ProjectCard id="speakers" />
		<ProjectCard id="table" />
		<ProjectCard id="boom-mic-stand" />
		<ProjectCard id="greenhouse" />
		<ProjectCard id="rpi-remote-backup" />
		<ProjectCard id="wheel-respoke" />
	</div>
</div>

<style>
	.internalLink {
		text-decoration: underline;
		color: black;
	}
</style>
