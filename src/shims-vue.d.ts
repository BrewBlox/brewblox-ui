declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

declare module '*.json' {
  const value: any;
  export default value;
}

declare module 'portal-vue';
declare module 'vuedraggable';
declare module 'url-safe-string';
declare module 'parse-duration';

declare module '*.svg';

declare module 'worker-loader!*' {
  class WebpackWorker extends Worker {
    public constructor();
  }

  export default WebpackWorker;
}
