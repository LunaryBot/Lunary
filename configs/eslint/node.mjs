import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import importHelpers from 'eslint-plugin-import-helpers'
import unusedImports from 'eslint-plugin-unused-imports'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'], 
    languageOptions: { globals: globals.browser },
    ignores: ['**/build/**', '**/node_modules/**', '**/dist/**'],
  },
  tseslint.configs.base,
  {
    rules: { 
      'no-unused-vars': 'off',
      'no-redeclare': 'off',
      'no-undef': 'off',
    }, 
  },
  {
    plugins: {
      '@import-helpers': importHelpers, '@unused-imports': unusedImports, 
    },
    rules: {
      '@import-helpers/order-imports': [
        'warn',
        {
          newlinesBetween: 'always',
          groups: [
            ['/node:/'],
            'module',
            ['/^@/infra/'],
            ['/^@/core/'],
            ['/^@/domain/'],
            ['/^@/utils/'],
            ['/@//'],
            ['/@types/', '/typing*/'],
            ['parent', 'sibling', 'index'],
          ],
          alphabetize: {
            order: 'asc', ignoreCase: true, 
          },
        },
      ],
      '@unused-imports/no-unused-imports': 'warn',
    },
  },
  {
    plugins: { '@stylistic': stylistic },
    rules: {
      '@stylistic/indent': ['warn', 2],
      '@stylistic/semi': ['warn', 'never'],
      '@stylistic/quotes': ['warn', 'single'],
      '@stylistic/lines-between-class-members': ['warn', 'always'],
      '@stylistic/no-multiple-empty-lines': ['warn'],
      // '@stylistic/object-curly-newline': ['warn', {
      //   'multiline': true,
      //   'minProperties': 2,
      // }],
      '@stylistic/object-curly-spacing': ['warn', 'always'],
      '@stylistic/operator-linebreak': ['warn', 'before'],
      '@stylistic/padded-blocks': ['error', 'never'],
      '@stylistic/rest-spread-spacing': ['error', 'never'],
      '@stylistic/space-before-blocks': ['warn'],
      '@stylistic/switch-colon-spacing': ['error'],
      '@stylistic/type-annotation-spacing': ['warn'],
      '@stylistic/type-generic-spacing': ['error'],
      '@stylistic/wrap-iife': ['error', 'inside'],
      '@stylistic/comma-dangle': ['warn', 'always-multiline'],
      '@stylistic/padding-line-between-statements': [
        'warn',
        {
          blankLine: 'always',
          prev: ['const', 'let', 'var'],
          next: '*',
        },
        {
          blankLine: 'any',
          prev: ['const', 'let', 'var'],
          next: ['const', 'let', 'var'],
        },
        {
          blankLine: 'always',
          prev: ['case', 'default'],
          next: '*',
        },
      ],
      '@stylistic/keyword-spacing': [
        'warn', {
          after: true,
          overrides: {
            if: { after: false },
            switch: { after: true },
            for: { after: false },
            catch: { after: true },
            while: { after: false },
            else: { after: true },
            var: { after: true },
            let: { after: true },
            const: { after: true },
            typeof: { after: true },
            return: { after: true },
            export: { after: true },
            import: { after: true },
          },
        },
      ],
    },
  },
])