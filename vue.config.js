module.exports = {
  lintOnSave: true,
  configureWebpack: (config) => {
    // make sure to keep function names when uglifying to prevent Vuex-TypeScript from crying
    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimizer[0].options.uglifyOptions = Object.assign(
        {},
        config.optimization.minimizer[0].options.uglifyOptions,
        {
          ecma: 5,
          compress: {
            keep_fnames: true,
          },
          warnings: false,
          mangle: {
            keep_fnames: true,
          },
        },
      );
    }
  },
  chainWebpack: (config) => {
    // add quasar alias
    config.resolve.alias
      .set('quasar', 'quasar-framework/dist/quasar.mat.esm');

    // We're only using a subset from plotly
    // Add alias to enable typing regardless
    config.resolve.alias
      .set('plotly.js', 'plotly.js-basic-dist');

    // enable ts checking
    config.module
      .rule('ts')
      .use('ts-loader')
      .tap(options => ({
        ...options,
        transpileOnly: false,
      }));

    // add svg loader
    const svgRule = config.module.rule('svg');

    svgRule.uses.clear();

    // add replacement loader(s)
    svgRule
      .use('vue-svg-loader')
      .loader('vue-svg-loader');

    // disable fork-ts-checker
    config
      .plugins
      .delete('fork-ts-checker');
  },
};
