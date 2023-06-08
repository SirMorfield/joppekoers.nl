<script>
	import { onMount } from 'svelte'

	let file = null

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
			const form = document.getElementById('my-form')
			form.submit()
		}
	}

	onMount(function () {
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

<div id="drop-area" style="border: 2px dashed gray; padding: 20px; text-align: center;">
	<h3>Drag and Drop a File</h3>
	{#if file}
		<p>Selected file: {file.name}</p>
	{/if}
</div>

<form id="my-form" action="/drop/up" method="post" enctype="multipart/form-data">
	<input name="file" type="file" id="file-input" on:change={handleFileInputChange} style="display: none;" />
	<button
		type="button"
		on:click={function () {
			document.getElementById('file-input').click()
		}}>
		Select File
	</button>
</form>

<style>
	.drag-over {
		border: 2px dashed blue;
	}
</style>
