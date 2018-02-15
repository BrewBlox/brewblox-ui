// standard declarations for *.vue files
declare module "*.vue" {
  import Vue from "vue";
  export default Vue;
}

// Quasar specific declarations
declare module "quasar";
declare const __THEME: string;

// process.env declaration
declare var process: {
  env: {
    VUE_ROUTER_MODE: 'hash' | 'history',
    VUE_ROUTER_BASE: string,
  }
};

// interface for plugin arguments
interface PluginArguments {
  app: any;
  store: any;
  Vue: any;
  router: any;
}
