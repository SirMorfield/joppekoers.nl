import { sveltekit } from '@sveltejs/kit/vite'
import type { UserConfig } from 'vite'

// https://vitejs.dev/config/
const config: UserConfig = {
	plugins: [sveltekit()],
	server: {
		port: Number(process.env.PORT) || 5173,
		host: true,
	},
}

export default config
