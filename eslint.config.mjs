import config from './configs/eslint/node.mjs'

export default [
  {
    ignores: ['**/old/**', '**/dist/**', '**/build/**', '**/node_modules/**'],
  },
  ...config,
]
