import { featureStore } from '@/store/features';

import ExampleFeature from './ExampleFeature';

// This function is how our plugin can be added to the application
// To activate it, import this file in src/main.ts, and add it to the list of plugins
export default {
  install() {
    // This plugin only has one feature
    // We must add it to big list of features, so it can be displayed on dashboards
    featureStore.createFeature(ExampleFeature);

    // Note: to keep things simple, this addon does not create a provider
    // This is neccessary as soon as we have to communicate with multiple external services of the same type
    // See the spark plugin for code examples on how to create a provider
  },
};
