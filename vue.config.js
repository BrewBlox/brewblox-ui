/* eslint-disable @typescript-eslint/no-var-requires */
const { gitDescribeSync } = require('git-describe');
const fs = require('fs');
/* eslint-enable */

module.exports = {
  pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: false,
    },
    quasar: {
      treeShake: true,
    },
  },
  transpileDependencies: [/[\\\/]node_modules[\\\/]quasar[\\\/]/],
  configureWebpack: (config) => {
    config.devtool = 'source-map';
    if (process.env.NODE_ENV === 'production') {
      // Function names are required to set up functions for VueX functionality
      config
        .optimization
        .minimizer[0] // Terser
        .options
        .terserOptions
        .keep_fnames = true; // eslint-disable-line @typescript-eslint/camelcase
    }
  },
  chainWebpack: (config) => {
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
        experimentalWatchApi: true, // speeds up build
      }));

    config.module.rules.delete('eslint');

    // Write git version to a file that can be imported
    // src/build-env.json is gitignored, and will be replaced every time
    config
      .plugin('define')
      .tap((args) => {
        const gitInfo = gitDescribeSync(__dirname, { match: '[0-9]*' });
        const version = gitInfo.semverString;
        fs.writeFileSync('src/build-env.json', JSON.stringify({ version }));
        return args;
      });
  },
};
