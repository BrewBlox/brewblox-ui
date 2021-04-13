interface PanArguments {
  evt: MouseEvent | TouchEvent;
  position: { top: number; left: number };
  direction: 'left' | 'right' | 'up' | 'down';
  duration: number;
  distance: { x: number; y: number };
  offset: { x: number; y: number };
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

interface GridSize {
  cols: number;
  rows: number;
}

type InputRule = (val: any) => boolean | string;

interface SelectOption<T = any> {
  label: string;
  value: T;
}

type Mapped<T> = Record<string, T>;

type LooseDictionary = { [index in string]: any };

type Awaitable<T> = T | PromiseLike<T>;

interface HasId {
  id: string;
}

interface HasType {
  type: keyof any & string;
}

type Patch<T> = HasId & Partial<T>;

interface QuasarNode {
  label: string;
  value: any;
  children?: QuasarNode[];

  icon?: string;
  iconColor?: string;
  img?: string;
  avatar?: string;
  disabled?: boolean;
  expandable?: boolean;
  selectable?: boolean;
  handler?: (node: QuasarNode) => void;
  tickable?: boolean;
  noTick?: boolean;
  tickStrategy?: string;
  lazy?: boolean;
  header?: string;
  body?: string;
}
