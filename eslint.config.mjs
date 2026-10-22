import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import js from '@eslint/js';
import preact from 'eslint-config-preact';
import tseslint from 'typescript-eslint';

export default defineConfig(
	globalIgnores(['dist/*']),
	js.configs.recommended,
	tseslint.configs.strictTypeChecked,
	...preact,
	eslintConfigPrettier,

	{
		languageOptions: {
			globals: { ...globals.node },
			ecmaVersion: 'latest',
			sourceType: 'module',

			parserOptions: {
				ecmaFeatures: {
					impliedStrict: true,
					jsx: true,
				},

				projectService: {
					allowDefaultProject: ['eslint.config.mjs'],
				},
				tsconfigRootDir: import.meta.dirname,
			},
		},

		rules: {
			curly: 'error',
			'sort-imports': ['warn'],

			'@typescript-eslint/consistent-type-imports': 'error',
			'@typescript-eslint/no-invalid-void-type': [
				'error',
				{ allowAsThisParameter: true },
			],
			'@typescript-eslint/no-misused-promises': [
				'error',
				{ checksVoidReturn: false },
			],
			'@typescript-eslint/no-unused-vars': 'warn',
			'@typescript-eslint/require-await': 'off',
			'@typescript-eslint/restrict-template-expressions': [
				'error',
				{ allowBoolean: true, allowNumber: true },
			],
		},
	},
);
