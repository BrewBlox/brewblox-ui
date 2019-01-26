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

interface PanArguments {
  evt: MouseEvent | TouchEvent;
  position: { top: number; left: number; };
  direction: 'left' | 'right' | 'up' | 'down';
  duration: number;
  distance: { x: number; y: number; };
  delta: { x: number; y: number; };
  isFirst: boolean;
  isFinal: boolean;
}

interface HoldArguments {
  evt: MouseEvent | TouchEvent;
  position: { top: number; left: number; };
  duration: number;
}
