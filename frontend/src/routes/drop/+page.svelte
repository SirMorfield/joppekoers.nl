<script lang="ts">
	import Root from '$lib/Root.svelte'

	let files: FileList

	$: if (files) {
		console.log(files)

		for (const file of files) {
			console.log(`${file.name}: ${file.size} bytes`)
		}
	}
</script>

<Root>
	<div id="main">
		<form action="/drop/up" method="post" enctype="multipart/form-data">
			<label for="many">Select multiple files</label>
			<input bind:files id="many" name="file" multiple type="file" />
			<button type="submit">Submit</button>
		</form>

		{#if files}
			<h2>Selected files:</h2>
			{#each Array.from(files) as file}
				<p>{file.name} ({file.size} bytes)</p>
			{/each}
		{/if}
	</div>
</Root>

<style>
	#main {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
	}
	label {
		display: block;
		padding: 20px;
		background-color: #dddddd;
		color: black;
		display: inline-block;
		border-radius: 3px;
	}
	label:hover {
		cursor: pointer;
		box-shadow: 15px 15px 22px rgba(0, 0, 0, 0.25);
	}
	#many {
		display: none;
	}
</style>
