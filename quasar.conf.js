const { configure } = require('quasar/wrappers');
const fs = require('fs');
const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');
const zlib = require('zlib');

module.exports = configure(function (ctx) {
  const buildDate = new Date().toISOString();

  return {
    preFetch: false,

    supportTS: {
      tsCheckerConfig: {
        eslint: {
          enabled: true,
          files: './src/**/*.{ts,tsx,js,jsx,vue}',
        },
      },
    },

    sourceFiles: {
      router: 'src/router.ts',
      store: 'src/store/index.ts',
    },

    boot: [
      'externals',
      'register',
      'plugins',
      'providers',
    ],

    css: [
      'app.sass',
    ],

    extras: [
      'roboto-font',
      'material-icons',
      'mdi-v4',
    ],

    animations: [],

    framework: {
      importStrategy: 'auto',
      iconSet: 'mdi-v4',

      plugins: [
        'Cookies',
        'Notify',
        'Dialog',
        'LocalStorage',
        'SessionStorage',
      ],

      config: {
        dark: true,
        notify: { message: '', color: 'info' },
        brand: {
          'dark': '#282c34',
          'dark-bright': '#454c59',
        },
      },
    },

    devServer: {
      open: false,
      public: 'localhost',
      https: {
        key: fs.readFileSync('dev/traefik/brewblox.key'),
        cert: fs.readFileSync('dev/traefik/brewblox.crt'),
      },
    },

    build: {
      // Do not open a browser window after build is done
      open: false,

      // Setting scopeHoisting to true hides all TS error messages
      scopeHoisting: false,

      // Root path for the UI is /ui/ to prevent the backend proxy to having to route
      // wildcard requests to the UI
      publicPath: '/ui/',
      vueRouterMode: 'history',

      distDir: 'dist',
      analyze: false,
      gzip: true,
      extractCSS: true,

      devtool: ctx.dev
        ? 'eval-cheap-source-map'
        : undefined,

      env: ctx.dev
        ? {
          BLOX_DATE: buildDate,
          BLOX_API_DEV: true,
          BLOX_PERFORMANCE: false,
          // Replace these values when using a remote backend
          // Host/port are also defined in dev/utils.js
          BLOX_API_HOST: undefined,
          BLOX_API_PORT: 9001,
        }
        : {
          BLOX_DATE: buildDate,
        },

      extendWebpack: config => {
        config.performance.hints = ctx.prod ? 'warning' : false;

        config.resolve.alias = {
          ...config.resolve.alias,

          // We're only using a subset from plotly
          // Add alias to enable typing regardless
          'plotly.js': 'plotly.js-basic-dist',

          // This matches the @ alias set in tsconfig.json
          '@': path.resolve(__dirname, './src'),
        };

        config.plugins.push(
          // mqtt.js depends on multiple Node.JS libraries
          // In webpack 5+, these are no longer polyfilled by default
          new NodePolyfillPlugin(),
        );

        if (ctx.prod) {
          config.plugins.push(
            new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false }),
          );
        }

        // Replace the compression plugin because it was generating unnamed output files
        config.plugins.splice(
          config.plugins.findIndex(v => v instanceof CompressionPlugin),
          1,
          new CompressionPlugin({
            filename: '[path][base].br',
            algorithm: 'brotliCompress',
            test: /\.(js|css|html|svg)$/,
            compressionOptions: {
              params: {
                [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
              },
            },
            threshold: 10240,
            minRatio: 0.8,
            deleteOriginalAssets: false,
          }),
        );

      },
    },
  };
});
