module.exports = {
  'root': true,
  // 'parser': 'vue-eslint-parser',
  'parserOptions': {
    'ecmaVersion': 2018,
    'sourceType': 'module',
    'parser': '@typescript-eslint/parser'
  },
  'extends': [
    'plugin:vue/recommended',
    'plugin:@typescript-eslint/recommended',
    '@vue/typescript',
    "plugin:quasar/standard",
  ],
  'plugins': ['simple-import-sort', 'quasar'],
  'rules': {
    'quotes': ['error', 'single', { 'avoidEscape': true }],
    'class-methods-use-this': 0,
    'simple-import-sort/sort': 'error',
    'sort-imports': 'off',
    'import/order': 'off',
    'import/first': 0,
    'import/extensions': 0,
    'import/no-unresolved': 0,
    'import/prefer-default-export': 0,
    'import/newline-after-import': 0,
    'object-curly-newline': 0,
    'no-param-reassign': 0,
    'no-console': 'warn',
    'no-multiple-empty-lines': 'error',
    'vue/max-attributes-per-line': ['warn', {
      'order': [
        'DEFINITION',
        'LIST_RENDERING',
        'CONDITIONALS',
        'RENDER_MODIFIERS',
        'GLOBAL',
        'UNIQUE',
        'TWO_WAY_BINDING',
        'OTHER_DIRECTIVES',
        'OTHER_ATTR',
        'EVENTS',
        'CONTENT'
      ]
    }],
    "vue/max-attributes-per-line": ["warn", {
      "singleline": 8,
      "multiline": {
        "max": 1,
        "allowFirstLine": false
      }
    }],
    'vue/html-self-closing': 0,
    'comma-dangle': [
      'error',
      'always-multiline'
    ],
    'semi': 'error',
    'max-len': [
      'error',
      120,
      2,
      {
        'ignoreUrls': true,
        'ignoreComments': false
      }
    ],
    '@typescript-eslint/indent': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/explicit-function-return-type': ['warn', {
      allowExpressions: true,
      allowTypedFunctionExpressions: true,
      allowHigherOrderFunctions: true,
    }],
    // temporary disabled because of incompatibility issues between vue-eslint-plugin and eslint 6:
    // see https://github.com/vuejs/eslint-plugin-vue/issues/944
    'vue-require-component-is': 0,
    '@typescript-eslint/no-empty-function': 0,
    'vue/no-v-html': 0
  }
}
