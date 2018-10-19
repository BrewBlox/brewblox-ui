import { ref, autoRegister } from '@/helpers/component-ref';
import { createFeature } from '@/store/features/actions';
import { createProvider } from '@/store/providers/actions';
import { register } from './store';
import { fetch as fetcher } from './store/actions';
import { typeName as id } from './store/getters';
import features from './features';
import wizard from './HistoryWizard.vue';

export default ({ store }: PluginArguments) => {
  autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));

  Object
    .values(features)
    .forEach(feature => createFeature(store, feature));

  createProvider(store, {
    id,
    fetcher,
    displayName: 'BrewBlox History',
    features: Object.keys(features),
    wizard: ref(wizard),
    initializer: register,
  });
};
