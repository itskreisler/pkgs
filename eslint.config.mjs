// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['node_modules', 'dist/', 'bin/'] },
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
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
        'no-async-promise-executor': 'off'
    }
  }
)
