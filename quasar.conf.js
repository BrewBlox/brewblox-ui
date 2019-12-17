/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/camelcase */

const { gitDescribeSync } = require('git-describe');
const fs = require('fs');
const path = require('path');

module.exports = function (ctx) {
  return {
    preFetch: false,
    supportIE: false,

    // vendor: {
    //   remove: ['d3'],
    // },

    sourceFiles: {
      router: 'src/router.ts',
      store: 'src/store/index.ts',
    },

    boot: [
      'externals',
      'register',
      'plugins',
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
      all: false,
      dark: true,

      components: [
        'QBadge',
        'QBar',
        'QBtn',
        'QBtnDropdown',
        'QBtnToggle',
        'QCard',
        'QCardActions',
        'QCardSection',
        'QCheckbox',
        'QChip',
        'QColor',
        'QDate',
        'QDialog',
        'QExpansionItem',
        'QField',
        'QIcon',
        'QInnerLoading',
        'QInput',
        'QItem',
        'QItemLabel',
        'QItemSection',
        'QLayout',
        'QDrawer',
        'QHeader',
        'QList',
        'QMenu',
        'QOptionGroup',
        'QPage',
        'QPageContainer',
        'QRadio',
        'QResizeObserver',
        'QScrollArea',
        'QSelect',
        'QSeparator',
        'QSlider',
        'QSpace',
        'QSpinner',
        'QSplitter',
        'QStep',
        'QStepper',
        'QStepperNavigation',
        'QTab',
        'QTabPanel',
        'QTabPanels',
        'QTabs',
        'QTime',
        'QTimeline',
        'QTimelineEntry',
        'QToggle',
        'QToolbar',
        'QToolbarTitle',
        'QTooltip',
        'QTree',
      ],

      directives: [
        'Ripple',
        'ClosePopup',
        'TouchHold',
        'TouchPan',
      ],

      plugins: ['Cookies', 'Notify', 'Dialog'],

      config: {
        notify: { message: '', color: 'info' },
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
      open: false,
      scopeHoisting: false,
      // scopeHoisting: true,
      publicPath: '/ui/',
      analyze: true,
      // vueCompiler: true,
      // preloadChunks: false,
      vueRouterMode: 'history',
      gzip: true,
      extractCSS: true,

      extendWebpack: config => {
        if (ctx.prod) {
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

        config.context = __dirname;
      },

      //
      // ChainWebpack configuration
      //
      /** @type { import("webpack-chain") } */
      chainWebpack: config => {

        // This setting is useless for a SPA that loads most of its code on startup
        // config.plugins.delete('prefetch');

        // We're only using a subset from plotly
        // Add alias to enable typing regardless
        config.resolve.alias.set('plotly.js', 'plotly.js-basic-dist');

        config.resolve.alias.set('@', path.resolve(__dirname, './src'));

        // enable ts checking
        // config.module
        //   .rule('typescript')
        //   .test(/\.tsx?$/)
        //   .use('ts-loader')
        //   .loader('ts-loader')
        //   .tap(options => ({
        //     ...options,
        //     transpileOnly: true,
        //     appendTsSuffixTo: [/\.vue$/],
        //   }));

        config.module.rules.delete('eslint');

        // Write git version to a file that can be imported
        // src/build-env.json is gitignored, and will be replaced every time
        config
          .plugin('define')
          .tap((args) => {
            const gitInfo = gitDescribeSync(__dirname, { match: '[0-9]*' });
            const version = gitInfo.semverString;
            const date = new Date().toString();
            fs.writeFileSync(path.resolve(__dirname, 'src/build-env.json'), JSON.stringify({ version, date }));
            return args;
          });
      },
    },
  };
};
