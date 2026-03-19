module.exports = {
	root: true,
	ignorePatterns: ['**/dist/**', '**/node_modules/**', '**/coverage/**'],
	overrides: [
		{
			files: ['front/src/**/*.{ts,tsx}', 'back/src/**/*.ts'],
			parser: '@typescript-eslint/parser',
			parserOptions: {
				project: ['./front/tsconfig.json', './back/tsconfig.json'],
				tsconfigRootDir: __dirname,
				ecmaVersion: 'latest',
				sourceType: 'module',
				ecmaFeatures: {
					jsx: true,
				},
			},
			plugins: ['@typescript-eslint', 'security'],
			extends: [
				'eslint:recommended',
				'plugin:@typescript-eslint/recommended',
				'plugin:security/recommended',
			],
			rules: {
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
			plugins: ['react', 'no-unsanitized'],
			extends: [
				'plugin:react/recommended',
				'plugin:no-unsanitized/recommended-legacy',
			],
			settings: {
				react: {
					version: 'detect',
				},
			},
			rules: {
				'react/react-in-jsx-scope': 'off',
				'react/prop-types': 'off',
			},
		},
	],
};
