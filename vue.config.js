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
