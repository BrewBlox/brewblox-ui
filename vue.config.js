const apiMocker = require('connect-api-mocker');

module.exports = {
  lintOnSave: true,
  devServer: {
    before(app) {
      // use api mocker
      app.use('/api', apiMocker('mocks/api'));
    },
  },
  chainWebpack: (config) => {
    // add quasar alias
    config.resolve.alias
      .set('quasar', 'quasar-framework/dist/quasar.mat.esm');

    // enable ts checking
    config.module
      .rule('ts')
      .use('ts-loader')
      .tap((options) => ({
        ...options,
        transpileOnly: false,
      }));

    config
      .plugins
      .delete('fork-ts-checker');
  },
};
