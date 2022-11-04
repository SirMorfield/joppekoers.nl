import { defineConfig, UserConfigExport } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
const config: UserConfigExport = {
	plugins: [svelte()],
	base: '/svelte'
}
export default defineConfig(config)
