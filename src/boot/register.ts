import { autoRegister } from '@/helpers/component-ref';

export default (): void => {
  autoRegister(require.context('../components', true));
};
