module.exports = {
	root: true,
	ignorePatterns: ['**/dist/**', '**/node_modules/**', '**/coverage/**'],
	overrides: [
		{
			files: ['front/src/**/*.{ts,tsx}'],
			env: {
				browser: true,
				es2021: true,
			},
			parser: '@typescript-eslint/parser',
			parserOptions: {
				project: ['./front/tsconfig.json'],
				tsconfigRootDir: __dirname,
				ecmaVersion: 'latest',
				sourceType: 'module',
				ecmaFeatures: {
					jsx: true,
				},
			},
			plugins: ['@typescript-eslint', 'react', 'security', 'no-unsanitized'],
			extends: [
				'eslint:recommended',
				'plugin:react/recommended',
				'plugin:security/recommended',
				'plugin:no-unsanitized/DOM',
			],
			settings: {
				react: {
					version: 'detect',
				},
			},
			rules: {
				'no-undef': 'off',
				'no-unused-vars': 'off',
				'react/react-in-jsx-scope': 'off',
				'react/prop-types': 'off',
				// Mantemos a responsabilidade de estilo/formatação com o Biome.
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
			files: ['back/src/**/*.ts'],
			env: {
				node: true,
				es2021: true,
			},
			parser: '@typescript-eslint/parser',
			parserOptions: {
				project: ['./back/tsconfig.json'],
				tsconfigRootDir: __dirname,
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
			plugins: ['@typescript-eslint', 'security'],
			extends: ['eslint:recommended', 'plugin:security/recommended'],
			rules: {
				'no-undef': 'off',
				'no-unused-vars': 'off',
				'@typescript-eslint/no-unused-vars': [
					'warn',
					{
						argsIgnorePattern: '^_',
						varsIgnorePattern: '^_',
					},
				],
			},
		},
	],
};
