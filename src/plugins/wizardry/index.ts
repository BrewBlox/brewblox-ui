import { Plugin } from 'vue';
import { globRegister } from '@/utils/component-ref';

const plugin: Plugin = {
  install(app) {
    globRegister(
      app,
      import.meta.glob('./components/**/*.vue', { eager: true }),
    );
  },
};

export default plugin;
