import { boot } from 'quasar/wrappers';

import { autoRegister } from '@/utils/component-ref';

export default boot(({ app }) => {
  autoRegister(app, require.context('../components', true));
});
