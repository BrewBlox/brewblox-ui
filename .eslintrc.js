module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  extends: 'airbnb-base',
  // required to lint *.vue files
  plugins: [
    'html',
    'import',
  ],
  globals: {
    'cordova': true,
    'DEV': true,
    'PROD': true,
    '__THEME': true,
  },
  settings: {
    'import/core-modules': [ 'quasar' ],
  },
  // add your custom rules here
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    'one-var': 0,
    'import/first': 0,
    'no-unused-vars': 1,
    'arrow-body-style': 1,
    'indent': 1,
    'no-trailing-spaces': 1,
    'comma-dangle': 1,
    // allow setting properties in state parameter of function
    'no-param-reassign': [2, { 'props': true, 'ignorePropertyModificationsFor': ['state'] }],
    // set devDependencies to true to prevent linting errors from them
    'import/no-extraneous-dependencies': [2, { devDependencies: true }],
    // allow longer line length
    'max-len': [1, 120, 2, {ignoreComments: true}],
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'brace-style': [2, 'stroustrup', { 'allowSingleLine': true }]
  }
}
