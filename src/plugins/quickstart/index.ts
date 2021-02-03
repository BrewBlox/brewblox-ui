import { autoRegister } from '@/helpers/component-ref';
import { featureStore } from '@/store/features';

import BrewKettle from './BrewKettle';
import Ferment from './Ferment';
import Fridge from './Fridge';
import Glycol from './Glycol';
import Herms from './Herms';
import Rims from './Rims';
import TempControl from './TempControl';

export default {
  install() {
    const wizards = [
      Ferment,
      Glycol,
      Herms,
      Rims,
      BrewKettle,
      Fridge,
    ];

    const widgets = [
      TempControl,
    ];

    autoRegister(require.context('./components', true));
    wizards.forEach(featureStore.registerQuickStart);
    widgets.forEach(featureStore.registerWidget);
  },
};
