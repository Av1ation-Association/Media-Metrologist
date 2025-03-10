// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
        languageOptions: {
            globals: globals.browser,
        },
    },
    {
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/consistent-type-imports': 'warn',
            semi: [
                'error',
                'always',
            ],
            'comma-dangle': [
                'warn',
                'always-multiline',
            ],
            quotes: [
                'warn',
                'single',
                {
                    avoidEscape: true,
                    allowTemplateLiterals: true,
                },
            ],
            indent: [
                'warn',
                4,
                {
                    SwitchCase: 1,
                },
            ],
        },
    },
    {
        ignores: [
            'dist/*',
        ],
    },
);