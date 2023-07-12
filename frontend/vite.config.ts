import { sveltekit } from '@sveltejs/kit/vite'
import { searchForWorkspaceRoot, type UserConfig } from 'vite'
import { imagetools } from '@zerodevx/svelte-img/vite'

const config: UserConfig = {
	plugins: [
		sveltekit(),
		imagetools(),
		{
			name: 'filepath',
			transform(code, id) {
				return code.replace('FILEPATH', `'${id}'`)
			},
		},
	],
	server: {
		port: Number(process.env.PORT) || 5173,
		host: true,
		fs: {
			allow: [searchForWorkspaceRoot(process.cwd()), '/static/uploads/'],
		},
	},
}

export default config
