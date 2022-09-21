import { globRegister } from '@/utils/component-ref';
import { Plugin } from 'vue';
import BrewKettle from './BrewKettle';
import Ferment from './Ferment';
import Fridge from './Fridge';
import Glycol from './Glycol';
import Herms from './Herms';
import Rims from './Rims';
import TempControl from './TempControl';

const plugin: Plugin = {
  install(app) {
    globRegister(app, import.meta.globEager('./components/**/*.vue'));

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
