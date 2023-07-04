/** @type {import('tailwindcss').Config}*/
const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				'main-dark': 'var(--main-dark)',
				'main-light': 'var(--main-light)',
			},
		},
	},

	plugins: [],
}

module.exports = config
