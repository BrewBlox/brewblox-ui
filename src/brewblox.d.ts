// interface for plugin arguments
interface PluginArguments {
  store: any;
  router: any;
}

interface PanArguments {
  evt: MouseEvent | TouchEvent;
  position: { top: number; left: number };
  direction: 'left' | 'right' | 'up' | 'down';
  duration: number;
  distance: { x: number; y: number };
  delta: { x: number; y: number };
  isFirst: boolean;
  isFinal: boolean;
}

interface HoldArguments {
  evt: MouseEvent | TouchEvent;
  position: { top: number; left: number };
  duration: number;
}

interface XYPosition {
  x: number;
  y: number;
}
