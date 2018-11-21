import { autoRegister } from '@/helpers/component-ref';
import { createFeature } from '@/store/features/actions';
import { createProvider } from '@/store/providers/actions';
import features from './features';
import { register } from './store';
import { fetchAll, update } from './store/actions';

export default ({ store }: PluginArguments) => {
  autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));
  autoRegister(require.context('./provider', true, /[A-Z]\w+\.vue$/));

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
