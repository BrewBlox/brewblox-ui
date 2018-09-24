import { Feature } from '@/store/features/state';
import { createFeature } from '@/store/features/actions';
import { register } from './store';
import Metrics from './Metrics';
import wizard from './HistoryWizard.vue';
import { createProvider } from '@/store/providers/actions';

const features: { [id: string]: Feature } = {
  Metrics,
};

export default ({ store }: PluginArguments) => {
  Object
    .values(features)
    .forEach((feature: Feature) => {
      createFeature(store, feature);
    });

  createProvider(store, {
    id: 'History',
    displayName: 'BrewBlox History',
    features: Object.keys(features),
    wizard: wizard.name,
    initializer: register,
  });
};
