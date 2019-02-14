const { gitDescribeSync } = require('git-describe');

module.exports = {
  pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: false,
    },
  },
  configureWebpack: (config) => {
    config.devtool = 'source-map';
    if (process.env.NODE_ENV === 'production') {
      // Function names are required to set up functions for VueX functionality
      config
        .optimization
        .minimizer[0] // Terser
        .options
        .terserOptions
        .keep_fnames = true;
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

    config.module.rules.delete('eslint');

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

    // Set process.env.GIT_VERSION to git version
    config
      .plugin('define')
      .tap((args) => {
        const gitInfo = gitDescribeSync(__dirname, { match: '[0-9]*' });
        args[0]['process.env'].GIT_VERSION = `"${gitInfo.semverString}"`;
        return args;
      });
  },
};
