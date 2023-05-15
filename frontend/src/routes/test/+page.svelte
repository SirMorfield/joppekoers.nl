<script lang="ts">
	import Child from './Child.svelte'

	let wrapper: HTMLDivElement | null = null

	const containers = ['red', 'green']
	const containerBinds = containers.map(() => null)

	const goGreen = () => {
		while (containerBinds[0].childNodes.length) {
			containerBinds[0].childNodes.forEach((child: HTMLElement) => {
				console.log('goGreen', child)
				containerBinds[1].appendChild(child)
			})
		}
	}

	const goRed = () => {
		while (containerBinds[1].childNodes.length) {
			containerBinds[1].childNodes.forEach((child: HTMLElement) => {
				console.log('goRed', child)
				containerBinds[0].appendChild(child)
			})
		}
	}

	function goInto() {
		containerBinds[1].appendChild(wrapper)
	}
</script>

<button on:click={goRed}>Red</button>
<button on:click={goGreen}>Green</button>

<button on:click={goInto}>goInto</button>

<div id="root">
	{#each containers as container, index}
		<div class="color" bind:this={containerBinds[index]} id={container} style="background-color: {container};">
			{container}
		</div>
	{/each}
</div>

<div bind:this={wrapper}>
	<Child />
</div>

<!-- slotHolder.childNodes.forEach((node, i) => {
	delivery.appendChild(node)
	console.log(node) // TODO
}) -->
<style>
	.color {
		width: 100px;
		height: 100px;
	}
	#root {
		display: flex;
	}
</style>
