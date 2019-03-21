module.exports = {
  presets: ["@vue/app"],
  plugins: [
    "@babel/plugin-syntax-dynamic-import",
    [
      "transform-imports",
      {
        quasar: {
          transform: "quasar/dist/babel-transforms/imports.js",
          preventFullImport: true
        }
      }
    ]
  ]
};
