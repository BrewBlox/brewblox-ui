import { autoRegister } from '@/helpers/component-ref';
import { featureStore } from '@/store/features';

import Ferment from './Ferment';
import Herms from './Herms';

export default {
  install() {
    autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));

    [
      Ferment,
      Herms,
    ]
      .forEach(featureStore.createQuickStart);
  },
};
