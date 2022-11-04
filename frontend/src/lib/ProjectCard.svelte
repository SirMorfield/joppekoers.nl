<script lang="ts">
	export let thumbnail: string
	export let alt: string = ''
</script>

<div>
	<img src={thumbnail} alt={alt}>
</div>