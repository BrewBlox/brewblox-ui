import { autoRegister } from '@/helpers/component-ref';
import {
  base64ToHex,
  durationString,
  hexToBase64,
  unitDurationString,
  shortDateString,
  dateString,
  round,
  truncate,
} from '@/helpers/functional';
import { Link, Unit } from '@/helpers/units';
import { createFeature } from '@/store/features/actions';
import { createProvider } from '@/store/providers/actions';
import { Service } from '@/store/services/state';
import { RootStore } from '@/store/state';
import Vue from 'vue';
import features from './features';
import { register } from './store';
import { createUpdateSource, fetchAll, fetchDiscoveredBlocks } from './store/actions';

const initialize = async (store: RootStore, service: Service) => {
  await register(store, service);
  await Promise.all([
    createUpdateSource(store, service.id),
    fetchDiscoveredBlocks(store, service.id),
  ]);
};

export default ({ store }: PluginArguments) => {
  autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));
  autoRegister(require.context('./provider', true, /[A-Z]\w+\.vue$/));

  Vue.filter(
    'unit',
    (value: Unit | null) =>
      (value !== null && value !== undefined ? value.toString() : '-'));
  Vue.filter(
    'link',
    (value: Link | null) =>
      (value !== null && value !== undefined ? value.toString() : '-'));
  Vue.filter('round', round);
  Vue.filter('hexToBase64', hexToBase64);
  Vue.filter('base64ToHex', base64ToHex);
  Vue.filter('duration', durationString);
  Vue.filter('truncated', truncate);
  Vue.filter('unitDuration', unitDurationString);
  Vue.filter('dateString', dateString);
  Vue.filter('shortDateString', shortDateString);

  Object.values(features).forEach(feature => createFeature(store, feature));

  createProvider(store, {
    id: 'Spark',
    displayName: 'Spark Controller',
    features: Object.keys(features),
    initializer: initialize,
    fetcher: fetchAll,
    wizard: 'SparkWizard',
    page: 'SparkPage',
  });
};
