import { register } from './store';
import ExampleFeature from './ExampleFeature';
import { createFeature } from '@/store/features/actions';

// We're dynamically adding a new store module to VueX
// To allow multiple services using the same type of store, we must give it an ID
export const MODULE_ID = 'exampleModule';

// This function is how our plugin can be added to the application
// To activate it, import this file in src/main.ts, and add it to the list of plugins
export default ({ store }: PluginArguments) => {
  // Add the new store module to VueX
  // We can now use the functions in the ./store directory
  register(store, MODULE_ID);

  // This plugin only has one feature
  // We must add it to big list of features, so it can be displayed on dashboards
  createFeature(store, ExampleFeature);

  // Note: to keep things simple, this addon does not create a provider
  // This is neccessary as soon as we have to communicate with multiple external services of the same type
  // See the spark plugin for code examples on how to create a provider
};
