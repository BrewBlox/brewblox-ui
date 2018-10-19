import { ref, autoRegister } from '@/helpers/component-ref';
import { createProvider } from '@/store/providers/actions';
import { createFeature } from '@/store/features/actions';
import features from './features';
import { register } from './store';
import { fetchAll } from './store/actions';

import page from './provider/SparkPage.vue';
import wizard from './provider/SparkWizard.vue';

export default ({ store }: PluginArguments) => {
  autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));

  Object
    .values(features)
    .forEach(feature => createFeature(store, feature));

  createProvider(store, {
    id: 'Spark',
    displayName: 'Spark Controller',
    features: Object.keys(features),
    initializer: register,
    fetcher: fetchAll,
    wizard: ref(wizard),
    page: ref(page),
  });
};
