<script lang="ts">
	import Root from '$lib/Root.svelte'

	let file: File | undefined
	let form: HTMLFormElement | undefined
	let fileInput: HTMLInputElement | undefined
	let dropArea: HTMLDivElement | undefined

	function handleFileDrop(event: DragEvent) {
		event.preventDefault()
		file = event.dataTransfer.files[0]
		fileInput.files = event.dataTransfer.files
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

	function onDragover(event) {
		event.preventDefault()
		dropArea.style.border = '2px dashed blue'
	}

	function onDragleave() {
		dropArea.style.border = '2px dashed gray'
	}
</script>

<Root>
	<div
		bind:this={dropArea}
		on:drop={handleFileDrop}
		on:dragover={onDragover}
		on:dragleave={onDragleave}
		style="border: 2px dashed gray; padding: 20px; text-align: center;">
		<h3>Drop a File</h3>
	</div>

	<form action="/drop/up" method="post" enctype="multipart/form-data" bind:this={form}>
		<input name="file" type="file" on:change={handleFileInputChange} bind:this={fileInput} style="display: none;" />
		<button type="button" on:click={() => fileInput.click()}> Select File </button>
	</form>
</Root>
