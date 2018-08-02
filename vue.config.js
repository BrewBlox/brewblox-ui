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

    // enable ts checking
    config.module
      .rule('ts')
      .use('ts-loader')
      .tap(options => ({
        ...options,
        transpileOnly: false,
      }));

    // disable fork-ts-checker
    config
      .plugins
      .delete('fork-ts-checker');
  },
};
