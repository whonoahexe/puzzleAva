module.exports = {
	extends: [
		'xo/esnext',
		'xo/browser',
		'xo-typescript',
	],
	parserOptions: {
		extraFileExtensions: ['.svelte'],
	},
	plugins: [
		'svelte3',
		'@typescript-eslint',
	],
	overrides: [
		{
			files: ['*.svelte'],
			processor: 'svelte3/svelte3',
			rules: {
				'no-multiple-empty-lines': 'off',
			},
		},
	],
	settings: {
		'svelte3/typescript': require('typescript'),
	},
	rules: {
		'@typescript-eslint/comma-dangle': ['error', 'always-multiline'],
		'@typescript-eslint/object-curly-spacing': ['error', 'always'],
		'@typescript-eslint/class-literal-property-style': ['error', 'fields'],
		'@typescript-eslint/prefer-readonly': ['off'],
		'@typescript-eslint/no-extraneous-class': ['off'],
		'@typescript-eslint/member-ordering': ['off'],
		'@typescript-eslint/array-type': ['error', { default: 'array' }],
		'@typescript-eslint/no-empty-function': ['off'],
		'operator-linebreak': ['error', 'before'],
		'capitalized-comments': ['off'],
		'accessor-pairs': ['off'],
		'no-eq-null': ['off'],
		eqeqeq: ['error', 'always', { null: 'ignore' }],
		'no-await-in-loop': ['off'],
		'arrow-parens': ['error', 'always'],
	},
};
