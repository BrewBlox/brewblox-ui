/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/camelcase */

const { gitDescribeSync } = require('git-describe');
const fs = require('fs');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const production = process.env.NODE_ENV === 'production';

/**
 * @type { import("@vue/cli-service").ProjectOptions }
 */
module.exports = {

  //
  // Vue configuration
  //
  publicPath: '/ui/',
  transpileDependencies: [/[\\\/]node_modules[\\\/]quasar[\\\/]/],
  pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: false,
    },
    quasar: {
      treeShake: true,
    },
  },
  devServer: {
    public: 'localhost',
    https: {
      key: fs.readFileSync('dev/traefik/brewblox.key'),
      cert: fs.readFileSync('dev/traefik/brewblox.crt'),
    },
  },

  //
  // Webpack configuration
  //
  configureWebpack: config => {
    if (production) {
      // Function names are required to set up functions for VueX functionality
      config
        .optimization
        .minimizer[0] // Terser
        .options
        .terserOptions
        .keep_fnames = true;
    }
    else {
      config.devtool = 'cheap-module-eval-source-map';
    }

    // This is merged into the webpack config
    return {
      output: {
        globalObject: 'this',
      },
      plugins: [
        new ForkTsCheckerWebpackPlugin({
          tslint: true,
          vue: true,
          tsconfig: './tsconfig.json',
          checkSyntacticErrors: true,
        }),
      ],
    };
  },

  //
  // ChainWebpack configuration
  //
  /** @type { import("webpack-chain") } */
  chainWebpack: config => {

    // This setting is useless for a SPA that loads most of its code on startup
    config.plugins.delete('prefetch');

    // We're only using a subset from plotly
    // Add alias to enable typing regardless
    config.resolve.alias.set('plotly.js', 'plotly.js-basic-dist');

    // enable ts checking
    config.module
      .rule('ts')
      .use('ts-loader')
      .tap(options => ({
        ...options,
        transpileOnly: true,
      }));

    config.module.rules.delete('eslint');

    // Write git version to a file that can be imported
    // src/build-env.json is gitignored, and will be replaced every time
    config
      .plugin('define')
      .tap((args) => {
        const gitInfo = gitDescribeSync(__dirname, { match: '[0-9]*' });
        const version = gitInfo.semverString;
        const date = new Date().toString();
        fs.writeFileSync('src/build-env.json', JSON.stringify({ version, date }));
        return args;
      });
  },
};
