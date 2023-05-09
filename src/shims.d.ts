declare module 'url-safe-string';
declare module 'fromentries';
// declare module 'simple-keyboard-layouts';
declare module '*.svg';
declare module '*.vue' {
  import { ComponentPublicInstance } from 'vue';
  const Component: ComponentPublicInstance;
  export default Component;
}
declare module 'mqtt/dist/mqtt.min' {
  import MQTT from 'mqtt';
  export = MQTT;
}
