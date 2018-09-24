import Vue from 'vue';
import { createProvider } from '@/store/providers/actions';
import { createFeature } from '@/store/features/actions';
import features from './features';
import page from './provider/SparkPage.vue';
import wizard from './provider/SparkWizard.vue';
import { register } from './store';
import { fetchBlocks } from './store/actions';
import { Feature } from '@/store/features/state';

Vue.component(page.name, page);
Vue.component(wizard.name, wizard);

export default ({ store }: PluginArguments) => {
  Object
    .values(features)
    .forEach((feature: Feature) => {
      createFeature(store, feature);
    });

  createProvider(store, {
    id: 'Spark',
    displayName: 'Spark Controller',
    features: Object.keys(features),
    initializer: register,
    fetcher: fetchBlocks,
    wizard: wizard.name,
    page: page.name,
  });
};
