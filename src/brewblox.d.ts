// process.env declaration
type env = {
  VUE_ROUTER_MODE: 'hash' | 'history',
  VUE_ROUTER_BASE: string,
};

declare const process: { env: env };

// interface for plugin arguments
interface PluginArguments {
  app: any;
  store: any;
  Vue: any;
  router: any;
}
