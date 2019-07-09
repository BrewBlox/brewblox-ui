import { autoRegister } from '@/helpers/component-ref';

export const components = autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));
export const parts = autoRegister(require.context('./parts', true, /[A-Z]\w+\.vue$/));
