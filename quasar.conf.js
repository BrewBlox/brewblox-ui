const { configure } = require('quasar/wrappers');
const fs = require('fs');
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');
const webpack = require('webpack');

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

    boot: ['externals', 'register', 'plugins', 'providers'],

    css: ['app.sass'],

    extras: ['roboto-font', 'material-icons', 'mdi-v4'],

    animations: [],

    framework: {
      importStrategy: 'auto',
      iconSet: 'mdi-v4',

      plugins: ['Cookies', 'Notify', 'Dialog', 'LocalStorage', 'SessionStorage'],

      config: {
        dark: true,
        notify: { message: '', color: 'info' },
        brand: {
          dark: '#282c34',
          'dark-bright': '#454c59',
        },
      },
    },

    devServer: {
      open: false,
      host: '0.0.0.0',
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

      devtool: ctx.dev ? 'eval-cheap-module-source-map' : undefined,

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

      extendWebpack: (config) => {
        config.performance.hints = ctx.prod ? 'warning' : false;

        config.resolve.alias = {
          ...config.resolve.alias,

          // We're only using a subset from plotly
          // Add alias to enable typing regardless
          'plotly.js': path.resolve(__dirname, './plotly-bundle'),
          // The bundler file still needs access to the actual plotly module
          'plotly-dist': path.resolve(__dirname, './node_modules/plotly.js'),

          // This matches the @ alias set in tsconfig.json
          '@': path.resolve(__dirname, './src'),
        };

        // Replace the compression plugin because it was generating unnamed output files
        const compressionIdx = config.plugins.findIndex((v) => v instanceof CompressionPlugin);
        if (compressionIdx >= 0) {
          config.plugins.splice(compressionIdx, 1, new CompressionPlugin());
        }

        config.plugins.push(
          // mqtt.js depends on multiple Node.JS libraries
          // In webpack 5+, these are no longer polyfilled by default
          new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser',
          }),
        );

        if (ctx.prod) {
          config.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false }));
        }
      },
    },
  };
});
