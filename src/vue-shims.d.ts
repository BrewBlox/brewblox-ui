// standard declarations for *.vue files
declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

// Quasar specific declarations
declare module 'quasar';
declare const __THEME: string;
