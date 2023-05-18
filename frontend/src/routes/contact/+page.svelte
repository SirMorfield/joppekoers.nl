<script lang="ts">
	import Root from '$lib/Root.svelte'

	interface Info {
		label: string
		value: string
		link?: string
	}
	const infos: readonly Info[] = [
		{ label: 'Name', value: 'Joppe Koers' },
		{ label: 'Email', value: 'joppe@joppekoers.nl' },
		{ label: 'LinkedIn', value: 'linkedin.com/in/joppekoers', link: 'https://www.linkedin.com/in/joppekoers/' },
		{ label: 'GitHub', value: 'SirMorfield', link: 'https://github.com/SirMorfield' },
	]
</script>

<Root>
	<div id="root">
		<table id="contact-table" class="shadow">
			{#each infos as info}
				<tr>
					<td class="item"><b>{info.label}</b></td>
					{#if info.link}
						<a href={info.link} class="link">
							<td class="item" id="name"> {info.value}</td>
						</a>
					{:else}
						<td class="item" id="name"> {info.value}</td>
					{/if}
					<!-- <td class="item">
						<button class="copy-button" on:click={() => navigator.clipboard.writeText('asda')}>
							<img src={copySymbol} alt="copySymbol" />
							copy
						</button>
					</td> -->
				</tr>
			{/each}
		</table>
	</div>
</Root>

<style>
	.shadow:hover {
		box-shadow: 15px 15px 22px rgba(0, 0, 0, 0.4);
	}
	#root {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		/* min-height: inherit; */
		/* background-color: red; */
	}

	.item {
		padding-right: 1em;
	}

	#contact-table {
		color: rgb(14, 10, 10);
		padding: 40px;
		background-color: rgb(255, 255, 252);
	}

	#contact-table:hover {
		box-shadow: 15px 15px 22px rgba(0, 0, 0, 0.25);
	}
	.link {
		text-decoration: underline;
		color: black;
	}
</style>
