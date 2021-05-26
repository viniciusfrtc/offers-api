module.exports = {
	env: {
		node: true,
		es6: true,
		jest: true,
	},
	extends: 'eslint:recommended',
	parserOptions: {
		ecmaVersion: 12,
	},
	rules: {
		indent: [2, 'tab'],
		'no-unused-vars': ['error', { varsIgnorePattern: '^_$' }],
		'no-trailing-spaces': 'error',
		'max-len': ['error', { code: 90, ignoreComments: true }],
		'comma-dangle': [
			'error',
			{
				objects: 'always-multiline',
				functions: 'always-multiline',
				arrays: 'always-multiline',
			},
		],
		'eol-last': ['error', 'always'],
		semi: ['error', 'never'],
		quotes: ['error', 'single', { 'allowTemplateLiterals': true }],
	},
}
