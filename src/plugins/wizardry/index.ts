import { globRegister } from '@/utils/component-ref';
import { Plugin } from 'vue';

export * from './utils';

const plugin: Plugin = {
  install(app) {
    globRegister(app, import.meta.globEager('./components/**/*.vue'));
  },
};

export default plugin;
