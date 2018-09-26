// process.env declaration
type env = {
  VUE_ROUTER_MODE: 'hash' | 'history',
  VUE_ROUTER_BASE: string,
};

// interface for plugin arguments
interface PluginArguments {
  store: any;
  router: any;
}
