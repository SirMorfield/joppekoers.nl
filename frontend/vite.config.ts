import { sveltekit } from '@sveltejs/kit/vite'
import { searchForWorkspaceRoot, type UserConfig } from 'vite'

const config: UserConfig = {
	plugins: [sveltekit()],
	server: {
		port: Number(process.env.PORT) || 5173,
		host: true,
		fs: {
			allow: [searchForWorkspaceRoot(process.cwd()), '/static/uploads/'],
		},
	},
}

export default config
