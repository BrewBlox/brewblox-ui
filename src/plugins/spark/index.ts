import { autoRegister } from '@/helpers/component-ref';
import { base64ToHex, durationString, hexToBase64 } from '@/helpers/functional';
import { Link, Unit } from '@/helpers/units';
import { createFeature } from '@/store/features/actions';
import { createProvider } from '@/store/providers/actions';
import Vue from 'vue';
import features from './features';
import { register } from './store';
import { fetchAll, update } from './store/actions';

export default ({ store }: PluginArguments) => {
  autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));
  autoRegister(require.context('./provider', true, /[A-Z]\w+\.vue$/));

  Vue.filter('unit', (value: Unit) => value.toString());
  Vue.filter('link', (value: Link) => value.toString());
  Vue.filter('round', (value: any) => (typeof value !== 'number' ? value : +value.toFixed(2)));
  Vue.filter('hexToBase64', hexToBase64);
  Vue.filter('base64ToHex', base64ToHex);
  Vue.filter('duration', durationString);

  Object
    .values(features)
    .forEach(feature => createFeature(store, feature));

  createProvider(store, {
    id: 'Spark',
    displayName: 'Spark Controller',
    features: Object.keys(features),
    initializer: register,
    fetcher: fetchAll,
    updater: update,
    wizard: 'SparkWizard',
    page: 'SparkPage',
  });
};
