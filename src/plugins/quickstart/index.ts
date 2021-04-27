import { Plugin } from 'vue';

import { autoRegister } from '@/utils/component-ref';

import BrewKettle from './BrewKettle';
import Ferment from './Ferment';
import Fridge from './Fridge';
import Glycol from './Glycol';
import Herms from './Herms';
import Rims from './Rims';
import TempControl from './TempControl';

const plugin: Plugin = {
  install(app) {
    autoRegister(app, require.context('./components', true));

    const plugins = [
      Ferment,
      Glycol,
      Herms,
      Rims,
      BrewKettle,
      Fridge,
      TempControl,
    ];

    plugins.forEach(app.use);
  },
};

export default plugin;
