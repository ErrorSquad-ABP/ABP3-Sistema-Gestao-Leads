const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const reactPlugin = require('eslint-plugin-react');
const securityPlugin = require('eslint-plugin-security');
const noUnsanitized = require('eslint-plugin-no-unsanitized');

module.exports = [
	{
		ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**'],
	},
	{
		files: ['front/src/**/*.{ts,tsx}', 'back/src/**/*.ts'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: ['./front/tsconfig.json', './back/tsconfig.json'],
				tsconfigRootDir: __dirname,
				ecmaVersion: 'latest',
				sourceType: 'module',
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		plugins: {
			'@typescript-eslint': tsPlugin,
			security: securityPlugin,
		},
		rules: {
			...js.configs.recommended.rules,
			...(securityPlugin.configs.recommended?.rules ?? {}),
			'no-undef': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
		},
	},
	{
		files: ['front/src/**/*.{ts,tsx}'],
		plugins: {
			react: reactPlugin,
			'no-unsanitized': noUnsanitized,
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
		rules: {
			...(reactPlugin.configs.recommended?.rules ?? {}),
			...(noUnsanitized.configs['recommended-legacy']?.rules ?? {}),
			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'off',
		},
	},
];
