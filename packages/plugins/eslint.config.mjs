// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default tseslint.config(
  { ignores: ['node_modules', 'dist/', 'bin/'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname
      }
    },
    rules: {
        quotes: [2, 'single', { avoidEscape: true }],
        'prefer-const': ['error', { ignoreReadBeforeAssign: true }],
        'space-before-function-paren': ['off'],
        '@typescript-eslint/no-explicit-any': 'off',
        'no-useless-escape': 'off',
        'eol-last': ['error', 'always'],
        semi: ['error', 'never'],
        'quote-props': ['error', 'as-needed'],
        'spaced-comment': ['error', 'always', { markers: ['/'] }],
        'comma-dangle': ['error', 'never'],
        'no-multiple-empty-lines': ['error', { max: 1 }],
        'no-async-promise-executor': 'off',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            ignoreRestSiblings: true,
            destructuredArrayIgnorePattern: '^_',
            args: 'after-used',
            vars: 'all',
            caughtErrors: 'none'
        }]
    }
  },
  // Configuración específica para archivos de test
  {
    files: ['test/**/*.ts', 'test/**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off'
    }
  }
)
