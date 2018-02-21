// standard declarations for *.vue files
declare module '*.vue' {
  import Vue from 'vue'; // eslint-disable-line
  export default Vue;
}

// Quasar specific declarations
declare module 'quasar';
declare const __THEME: string; // eslint-disable-line
