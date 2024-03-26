/// <reference types="vite/client" />

declare const __BREWBLOX_BUILD_DATE: string;
declare const __BREWBLOX_PERFORMANCE: boolean;
declare const __BREWBLOX_API_PROTOCOL: 'http' | 'https' | undefined;
declare const __BREWBLOX_API_HOST: string | undefined;
declare const __BREWBLOX_API_PORT: number | undefined;

interface XYPosition {
  x: number;
  y: number;
}

interface AreaSize {
  width: number;
  height: number;
}

type InputRule = (val: any) => boolean | string;

interface SelectOption<T = any> {
  label: string;
  value: T;
}

type Mapped<T> = { [index in string]: T };

type AnyDict = { [index in string]: any };

type Awaitable<T> = T | PromiseLike<T>;

type Maybe<T> = T | null | undefined;

type KeysOfUnion<T> = T extends T ? keyof T : never;

interface HasId {
  id: string;
}

interface HasType {
  type: keyof any & string;
}

type Patch<T> = HasId & Partial<T>;

type DeepNonNullable<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

type InferDefaults<T> = {
  [K in keyof T]?: InferDefault<T, T[K]>;
};

// eslint-disable-next-line @typescript-eslint/ban-types
type NativeType = null | number | string | boolean | symbol | Function;

type InferDefault<P, T> =
  | ((props: P) => T & {}) // eslint-disable-line @typescript-eslint/ban-types
  | (T extends NativeType ? T : never);
