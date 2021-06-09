import { autoComponents } from '@/utils/component-ref';

const parts = autoComponents(require.context('./'));

export default parts;
