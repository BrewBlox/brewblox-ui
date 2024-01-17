module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    '@vue/typescript',
    'plugin:quasar/standard',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'quasar'],
  rules: {
    quotes: ['error', 'single', { avoidEscape: true }],
    'class-methods-use-this': 0,
    'import/first': 0,
    'import/extensions': 0,
    'import/prefer-default-export': 0,
    'object-curly-newline': 0,
    'no-param-reassign': 0,
    'no-console': ['warn', { allow: ['assert'] }],
    'no-debugger': 'warn',
    'no-multiple-empty-lines': 'error',
    'comma-dangle': ['error', 'always-multiline'],
    semi: 'error',
    'max-len': [
      'error',
      100,
      2,
      {
        ignoreUrls: true,
        ignoreComments: false,
      },
    ],
    '@typescript-eslint/indent': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/camelcase': 0,
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      },
    ],
    'quasar/check-valid-props': 'warn',
    'vue/no-v-html': 0,
    'vue/max-attributes-per-line': [
      'warn',
      {
        singleline: 8,
        multiline: 1,
      },
    ],
    'vue/multi-word-component-names': [
      'error',
      {
        ignores: ['Card', 'Toolbar'],
      },
    ],
    'vue/no-v-text-v-html-on-component': 0,
    'vue/require-default-prop': 0,
  },
  overrides: [
    {
      files: ['*.mjs'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
    {
      files: ['dev/**.mjs'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: ['src/auto-import.d.ts'],
      rules: {
        'max-len': 'off',
      },
    },
  ],
};
