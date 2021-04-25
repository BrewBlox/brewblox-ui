declare module 'vue-json-pretty';
declare module 'url-safe-string';
declare module 'parse-duration';
declare module 'fromentries';
declare module 'simple-keyboard-layouts';
declare module '*.svg';
declare module '*.vue' {
  import { ComponentPublicInstance } from 'vue';
  const Component: ComponentPublicInstance;
  export default Component;
}
