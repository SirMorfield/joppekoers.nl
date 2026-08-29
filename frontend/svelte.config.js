import adapter from 'svelte-adapter-bun'
import preprocess from 'svelte-preprocess'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		preprocess({
			sourceMap: true,
			postcss: true,
		}),
	],

	kit: {
		adapter: adapter({
			out: 'build',
			precompress: {
				brotli: true,
				gzip: true,
			},
		}),
		alias: {
			$root: './src',
			$lib: './src/lib',
			'@shared': '../shared',
		},
		csrf: {
			checkOrigin: false,
		},
	},
}

export default config
