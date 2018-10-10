// standard declarations for *.vue files
declare module '*.vue' {
  import Vue from 'vue';

  export default Vue;
}

// Quasar specific declarations
declare module 'quasar';
// eslint-disable-next-line no-underscore-dangle
declare const __THEME: string;

declare module 'portal-vue';
declare module 'vuedraggable';
declare module 'url-safe-string';
declare module 'parse-duration';

declare module '*.svg';
