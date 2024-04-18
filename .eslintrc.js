module.exports = {
	env: {
		es2021: true,
		node: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	plugins: [
		'@typescript-eslint',
		'eslint-plugin-import-helpers',
	],
	rules: {
		indent: [
			'warn',
			'tab',
			{
				SwitchCase: 1, 
				ignoreComments: true,
				ObjectExpression: 1,
			},
		],
		quotes: [ 'warn', 'single' ],
		semi: [ 'warn', 'never' ],
		'no-empty': 0,
		'@typescript-eslint/ban-ts-comment': 0,
		'no-explicit-any': 0,
		'no-var': 'warn',
		'object-shorthand': ['warn', 'properties'],
		'no-extra-parens': ['warn', 'functions'],
		'keyword-spacing': [
			'warn', 
			{
				after: true, 
				overrides: {
					if: { after: false }, 
					switch: { after: true }, 
					for: { after: false }, 
					catch: { after: true },
					while: { after: false },
					else: { after: true },
					var: { after: true },
					let: { after: true },
					const: { after: true },
					typeof: { after: true },
					return: { after: true },
					export: { after: true },
					import: { after: true },
				},
			},
		],
		'prefer-const': 2,
		'key-spacing': [
			'warn', { 
				beforeColon: false, 
				afterColon: true, 
			},
		],
		'lines-between-class-members': [
			'warn', 
			'always', 
			{ exceptAfterSingleLine: true },
		],
		'multiline-ternary': [ 'warn', 'always-multiline' ],
		'new-cap': [
			'warn', 
			{ 
				newIsCap: true, 
				capIsNew: false, 
				properties: true, 
			},
		],
		'new-parens': 'warn',
		'no-array-constructor': 'warn',
		'space-in-parens': ['warn', 'never'],
		'object-shorthand': ['warn', 'properties'],
		'arrow-spacing': [
			'warn', {
				before: true, 
				after: true, 
			},
		],
		'comma-dangle': [
			'warn', {
				'arrays': 'always-multiline',
				'objects': 'always-multiline',
				'imports': 'always-multiline',
				'exports': 'always-multiline',
		  	},
		],
		'object-curly-spacing': [ 'warn', 'always' ],
		'import-helpers/order-imports': [
			'warn',
			{
				newlinesBetween: 'always',
				groups: [
					'module',
					'/^@/helpers/',
					'/^@/structures/',
					'/^@/services/',
					'/^@/utils/',
					'/^@/libs/',
					'/^@/env/',
					'/^@/@types/',
					['parent', 'sibling', 'index'],
				],
				alphabetize: { order: 'asc', ignoreCase: true },
			},
		],
	},
	ignorePatterns: ['build'],
}
