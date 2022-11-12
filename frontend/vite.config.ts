import { sveltekit } from '@sveltejs/kit/vite'
import type { UserConfig } from 'vite'

// https://vitejs.dev/config/
const config: UserConfig = {
	plugins: [sveltekit()],
}

export default config
