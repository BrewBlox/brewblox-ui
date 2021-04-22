import { VueConstructor } from 'vue/types/umd';

import { autoComponents } from '@/utils/component-ref';

const parts: { [name: string]: VueConstructor } = autoComponents(require.context('./'));

export default parts;
