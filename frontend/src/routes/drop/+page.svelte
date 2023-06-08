<script lang="ts">
	import Root from '$lib/Root.svelte'
	import { onMount } from 'svelte'

	let file = null
	let form: HTMLFormElement | undefined
	let fileInput: HTMLInputElement | undefined
	let dropArea: HTMLDivElement | undefined

	function handleFileDrop(event) {
		event.preventDefault()
		file = event.dataTransfer.files[0]
		document.getElementById('file-input').files = event.dataTransfer.files
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
		dropArea.addEventListener('dragover', event => {
			event.preventDefault()
			dropArea.classList.add('drag-over')
		})

		dropArea.addEventListener('dragleave', () => {
			dropArea.classList.remove('drag-over')
		})

		dropArea.addEventListener('drop', handleFileDrop)
	})
</script>

<Root>
	<div bind:this={dropArea} style="border: 2px dashed gray; padding: 20px; text-align: center;">
		<h3>Drop a File</h3>
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
