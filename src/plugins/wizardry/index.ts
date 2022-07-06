import { Plugin } from 'vue';

import { globRegister } from '@/utils/component-ref';

export * from './utils';

const plugin: Plugin = {
  install(app) {
    globRegister(app, import.meta.globEager('./components/**/*.vue'));
  },
};

export default plugin;
