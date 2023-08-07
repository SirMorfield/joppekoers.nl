<script>
	import { page } from '$app/stores'
	import Root from '$root/lib/Root.svelte'
</script>

<Root>
	{$page.error.message}
</Root>
