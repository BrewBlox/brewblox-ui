module.exports = {
  'root': true,
  'parser': 'vue-eslint-parser',
  'parserOptions': {
    'ecmaVersion': 2018,
    'sourceType': 'module',
    'parser': '@typescript-eslint/parser'
  },
  'extends': [
    'plugin:vue/recommended',
    'plugin:@typescript-eslint/recommended',
    '@vue/typescript'
  ],
  'rules': {
    'quotes': ['error', 'single', { 'avoidEscape': true }],
    'class-methods-use-this': 0,
    'import/first': 0,
    'import/extensions': 0,
    'import/no-unresolved': 0,
    'import/no-extraneous-dependencies': 0,
    'import/prefer-default-export': 0,
    'import/newline-after-import': 0,
    'object-curly-newline': 0,
    'no-param-reassign': 0,
    'no-mixed-operators': 0,
    'vue/max-attributes-per-line': 0,
    'comma-dangle': [
      'error',
      'always-multiline'
    ],
    'semi': 'error',
    'max-len': [
      1,
      120,
      2,
      {
        'ignoreUrls': true,
        'ignoreComments': false
      }
    ],
    '@typescript-eslint/indent': 0,
    '@typescript-eslint/no-explicit-any': 0
  }
}
