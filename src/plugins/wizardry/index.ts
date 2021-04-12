import { Plugin } from 'vue';

import { autoRegister } from '@/utils/component-ref';

export * from './utils';

const plugin: Plugin = {
  install(app) {
    autoRegister(app, require.context('./components', true));
  },
};

export default plugin;
