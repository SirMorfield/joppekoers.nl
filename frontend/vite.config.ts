import { sveltekit } from '@sveltejs/kit/vite'
import type { UserConfig } from 'vite'

// https://vitejs.dev/config/
const config: UserConfig = {
	plugins: [sveltekit()],
	base: '/svelte/',
}

export default config
