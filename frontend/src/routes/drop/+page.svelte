<script lang="ts">
	import Root from '$lib/Root.svelte'
	import { onMount } from 'svelte'

	let file = null
	let form: HTMLFormElement | undefined = undefined
	let fileInput: HTMLInputElement | undefined = undefined

	function handleFileDrop(event) {
		event.preventDefault()
		file = event.dataTransfer.files[0]
		submitForm()
	}

	function handleFileInputChange(event) {
		file = event.target.files[0]
		submitForm()
	}

	function submitForm() {
		if (file) {
			form.submit()
		}
	}

	onMount(() => {
		const dropArea = document.getElementById('drop-area')

		dropArea.addEventListener('dragover', function (event) {
			event.preventDefault()
			dropArea.classList.add('drag-over')
		})

		dropArea.addEventListener('dragleave', function () {
			dropArea.classList.remove('drag-over')
		})

		dropArea.addEventListener('drop', handleFileDrop)
	})
</script>

<Root>
	<div id="drop-area" style="border: 2px dashed gray; padding: 20px; text-align: center;">
		<h3>Drop a File</h3>
		{#if file}
			<p>Selected file: {file.name}</p>
		{/if}
	</div>

	<form id="my-form" action="/drop/up" method="post" enctype="multipart/form-data" bind:this={form}>
		<input
			name="file"
			type="file"
			id="file-input"
			on:change={handleFileInputChange}
			bind:this={fileInput}
			style="display: none;" />
		<button type="button" on:click={() => fileInput.click()}> Select File </button>
	</form>
</Root>

<style>
	.drag-over {
		border: 2px dashed blue;
	}
</style>
