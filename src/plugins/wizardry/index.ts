import { autoRegister } from '@/helpers/component-ref';

export * from './helpers';

export default {
  install() {
    autoRegister(require.context('./components', true));
  },
};
