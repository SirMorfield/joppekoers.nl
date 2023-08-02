<script lang="ts">
	import logo from '../assets/logo.svg'

	let navContent: HTMLDivElement | undefined = undefined
</script>

<nav
	class="flex items-center justify-between flex-wrap py-6 px-5 w-full z-10 top-0 fixed"
	on:mouseleave={() => navContent.classList.add('hidden')}>
	<div class="flex items-center flex-shrink-0 text-white mr-6 bg-main-dark rounded-xl p-2">
		<a class="text-white no-underline" href="/">
			<img src={logo} class="h-6 w-auto" alt="logo" width="1217" height="250" />
		</a>
	</div>

	<div class="block lg:hidden bg-main-dark border rounded-lg border-main-light">
		<button
			id="nav-toggle"
			class="flex items-center px-3 py-2 hover:text-white hover:border-white"
			on:click={() => navContent.classList.toggle('hidden')}>
			<svg class="fill-main-light h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
				<path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
			</svg>
		</button>
	</div>

	<div
		class="w-full flex-grow lg:items-start lg:w-auto hidden lg:block lg:pt-0 bg-main-dark rounded-xl"
		bind:this={navContent}>
		<ul class="list-reset lg:flex justify-start flex-1 items-start">
			<li class="mr-3">
				<a class="link" href="/">Home</a>
			</li>
			<li class="mr-3">
				<a class="link" href="/contact">Contact</a>
			</li>
			<li class="mr-3">
				<a class="link" href="/cv">cv </a>
			</li>
		</ul>
	</div>
</nav>

<div class="container shadow-lg mx-auto bg-white mt-20 md:mt-18" />

<style>
	.link {
		display: inline-block;
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		padding-left: 1rem;
		padding-right: 1rem;
		text-decoration: none;
	}

	.link:hover {
		color: #e5e7eb;
		text-decoration: underline;
	}
</style>
