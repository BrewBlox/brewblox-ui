import { autoRegister } from '@/helpers/component-ref';
import { featureStore } from '@/store/features';

import BrewKettle from './BrewKettle';
import Ferment from './Ferment';
import Glycol from './Glycol';
import Herms from './Herms';
import Rims from './Rims';

export default {
  install() {
    autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));

    [
      Ferment,
      Glycol,
      Herms,
      Rims,
      BrewKettle,
    ]
      .forEach(featureStore.registerQuickStart);
  },
};
