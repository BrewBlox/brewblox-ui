/// <reference types="vite/client" />

declare const __BREWBLOX_BUILD_DATE: string;
declare const __BREWBLOX_PERFORMANCE: boolean;
declare const __BREWBLOX_API_PROTOCOL: 'http' | 'https' | undefined;
declare const __BREWBLOX_API_HOST: string | undefined;
declare const __BREWBLOX_API_PORT: number | undefined;

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

interface SwipeArguments {
  touch: boolean;
  mouse: boolean;
  direction: 'up' | 'down' | 'left' | 'right';
  duration: number;
  distance: { x: number; y: number };
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

type AnyDict = { [index in string]: any };

type Awaitable<T> = T | PromiseLike<T>;

type Maybe<T> = T | null | undefined;

interface HasId {
  id: string;
}

interface HasType {
  type: keyof any & string;
}

type Patch<T> = HasId & Partial<T>;
