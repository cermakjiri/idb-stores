import pluginJs from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * @type {import("eslint").Linter.FlatConfig[]}
 */
export default [
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['./src/**/*.ts', './test/**/*.ts'],
        languageOptions: {
            globals: globals.browser,
        },
    },
    {
        languageOptions: {
            globals: globals.node,
        },
    },
    {
        files: ['**/*.ts'],
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-explicit-any': ['off'],
        },
    },
    {
        ignores: ['**/dist/**'],
    },
];
