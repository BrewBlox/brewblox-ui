const { configure } = require('quasar/wrappers');
const fs = require('fs');
const path = require('path');
const MonacoEditorPlugin = require('monaco-editor-webpack-plugin');

module.exports = configure(function (ctx) {
  const buildDate = new Date().toISOString();

  return {
    preFetch: false,
    supportTS: true,

    sourceFiles: {
      router: 'src/router.ts',
      store: 'src/store/index.ts',
    },

    boot: [
      'externals',
      'register',
      'plugins',
      'mixins',
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
      quiet: false,
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
        ? 'cheap-module-eval-source-map'
        : undefined,

      supportTS: {
        tsCheckerConfig: {
          eslint: true,
        },
      },

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
        config.plugins.push(new MonacoEditorPlugin({
          languages: ['javascript', 'css', 'html', 'typescript'],
        }));
        config.performance.hints = ctx.prod ? 'warning' : false;

        if (ctx.prod) {
          // Function names are required to set up functions for VueX functionality
          config
            .optimization
            .minimizer[0] // Terser
            .options
            .terserOptions
            .keep_fnames = true;
        }
      },

      chainWebpack: config => {
        // We're only using a subset from plotly
        // Add alias to enable typing regardless
        config.resolve.alias.set('plotly.js', 'plotly.js-basic-dist');

        // This matches the @ alias set in tsconfig.json
        config.resolve.alias.set('@', path.resolve(__dirname, './src'));
      },
    },
  };
});
