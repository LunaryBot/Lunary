module.exports = {
	env: {
		es2021: true,
		node: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module'
	},
	plugins: [
		'@typescript-eslint'
	],
	rules: {
		indent: [
			'warn',
			'tab'
		],
		quotes: [
			'warn',
			'single'
		],
		semi: [
			'warn',
			'always',
		],
		'no-empty': 0,
		'@typescript-eslint/ban-ts-comment': 0,
		'no-explicit-any': 0,
	},
	ignorePatterns: ['build'],
};