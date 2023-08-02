module.exports = {
	env: {
		browser: false,
		es2021: true,
		node: true,
	},
	parser: '@typescript-eslint/parser',
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended', 'prettier'], // The 'prettier' element must be last
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint', 'prettier'],
	ignorePatterns: ['/build'],
	rules: {
		'array-callback-return': 'error',
		curly: ['error', 'all'],
		'no-array-constructor': 'error',
		'no-duplicate-imports': ['error', { includeExports: true }],
		'no-extend-native': 'error',
		'no-nested-ternary': 'error',
		'no-return-assign': 'error',
		'no-return-await': 'error',
		'no-throw-literal': 'error',
		'no-unreachable-loop': 'error',
		'no-unused-private-class-members': 'error',
		'no-useless-catch': 'error',
		'no-useless-escape': 'error',
		'no-useless-return': 'error',
		'no-var': 'error',
		'prefer-const': 'error',
		'prefer-template': 'error',
		'require-await': 'error',
		'no-constant-condition': ['error', { checkLoops: false }],
		eqeqeq: ['error', 'smart'],
		'@typescript-eslint/ban-ts-comment': 'off',
	},
}
