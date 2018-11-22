module.exports = {
  configureWebpack: (config) => {
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
  },
};
