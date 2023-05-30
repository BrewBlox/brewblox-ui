import { globRegister } from '@/utils/component-ref';
import { Plugin } from 'vue';

const plugin: Plugin = {
  install(app) {
    globRegister(
      app,
      import.meta.glob('./components/**/*.vue', { eager: true }),
    );
  },
};

export default plugin;
