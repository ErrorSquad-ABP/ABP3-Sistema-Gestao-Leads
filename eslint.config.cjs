const js = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const securityPlugin = require('eslint-plugin-security');
const reactPlugin = require('eslint-plugin-react');
const noUnsanitizedPlugin = require('eslint-plugin-no-unsanitized');

const unusedVarsRule = [
	'warn',
	{
		argsIgnorePattern: '^_',
		varsIgnorePattern: '^_',
	},
];

module.exports = [
	{
		ignores: [
			'**/dist/**',
			'**/node_modules/**',
			'**/coverage/**',
			'**/.next/**',
		],
	},
	{
		files: ['front/src/**/*.{ts,tsx}'],
		languageOptions: {
			parser: tsParser,
			ecmaVersion: 'latest',
			sourceType: 'module',
			parserOptions: {
				project: ['./front/tsconfig.json'],
				tsconfigRootDir: __dirname,
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				window: 'readonly',
				document: 'readonly',
				localStorage: 'readonly',
				sessionStorage: 'readonly',
				fetch: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				alert: 'readonly',
				console: 'readonly',
			},
		},
		plugins: {
			'@typescript-eslint': tsPlugin,
			react: reactPlugin,
			security: securityPlugin,
			'no-unsanitized': noUnsanitizedPlugin,
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
		rules: {
			...js.configs.recommended.rules,
			...reactPlugin.configs.recommended.rules,
			...(securityPlugin.configs.recommended?.rules ?? {}),
			...(noUnsanitizedPlugin.configs['recommended-legacy']?.rules ?? {}),
			'no-undef': 'off',
			'no-unused-vars': 'off',
			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'off',
			'@typescript-eslint/no-unused-vars': unusedVarsRule,
		},
	},
	{
		files: ['back/src/**/*.ts'],
		languageOptions: {
			parser: tsParser,
			ecmaVersion: 'latest',
			sourceType: 'module',
			parserOptions: {
				project: ['./back/tsconfig.json'],
				tsconfigRootDir: __dirname,
			},
			globals: {
				process: 'readonly',
				console: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
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
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': unusedVarsRule,
		},
	},
];
