import { Store } from 'vuex';
import { autoRegister } from '@/helpers/component-ref';
import { createProvider } from '@/store/providers/actions';
import { createFeature } from '@/store/features/actions';
import features from './features';
import { register } from './store';
import { register as registerClass } from './class-store';
import { fetchAll, update } from './store/actions';
import { RootState } from '@/store/state';
import { Service } from '@/store/services/state';

const registerAll = async (store: Store<RootState>, service: Service) => {
  await register(store, service);
  await registerClass(store, service);
};

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
    initializer: registerAll,
    fetcher: fetchAll,
    updater: update,
    wizard: 'SparkWizard',
    page: 'SparkPage',
  });
};
