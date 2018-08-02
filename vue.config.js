module.exports = {
  lintOnSave: true,
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
