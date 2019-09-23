import { autoRegister } from '@/helpers/component-ref';
import { featureStore } from '@/store/features';

import Ferment from './Ferment';
import Herms from './Herms';
import Rims from './Rims';

export default {
  install() {
    autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));

    [
      Ferment,
      Herms,
      Rims,
    ]
      .forEach(featureStore.createQuickStart);
  },
};
