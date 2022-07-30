module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['import'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2021
  },
  rules: {
    'node/no-extraneous-import': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-unused-vars': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    'prefer-const': [
      'warn',
      {
        destructuring: 'all'
      }
    ],
    '@typescript-eslint/ban-types': 0,
    'no-useless-escape': 0,
    'no-undef': 0,
    '@typescript-eslint/no-explicit-any': 0
  },
  reportUnusedDisableDirectives: true
}
