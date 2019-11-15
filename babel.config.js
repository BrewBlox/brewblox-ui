module.exports = {
  presets: ['@vue/app'],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    [
      'transform-imports',
      {
        quasar: {
          transform: 'quasar/dist/babel-transforms/imports.js',
          preventFullImport: true,
        },
      },
    ],
  ],
};
