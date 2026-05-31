import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'

export default defineConfig([
	globalIgnores(['dist', 'coverage', 'tests']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^[A-Z_]' }],
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'never'],
      'no-var': 'error',
      'prefer-const': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    files: ['tests/**/*.test.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
      },
    },
  },
])
