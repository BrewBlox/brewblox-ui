import { ref } from '@/helpers/component-ref';
import { createFeature } from '@/store/features/actions';
import { createProvider } from '@/store/providers/actions';
import { register } from './store';
import features from './features';
import wizard from './HistoryWizard.vue';

export default ({ store }: PluginArguments) => {
  Object
    .values(features)
    .forEach(feature => createFeature(store, feature));

  createProvider(store, {
    id: 'History',
    displayName: 'BrewBlox History',
    features: Object.keys(features),
    wizard: ref(wizard),
    initializer: register,
  });
};
