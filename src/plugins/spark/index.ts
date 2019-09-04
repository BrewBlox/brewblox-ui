import { VueConstructor } from 'vue';

import { autoRegister } from '@/helpers/component-ref';
import { sparkStore } from '@/plugins/spark/store';
import { featureStore } from '@/store/features';
import { providerStore } from '@/store/providers';
import { Service } from '@/store/services';

import arrangements from './arrangements';
import features from './features';
import { typeName } from './getters';
import { installFilters } from './helpers';
import { BlockSpec } from './types';

const onAdd = async (service: Service): Promise<void> => {
  await sparkStore.addService(service.id);
  await sparkStore.fetchServiceStatus(service.id);
  await Promise.all([
    sparkStore.createUpdateSource(service.id),
    sparkStore.fetchDiscoveredBlocks(service.id),
  ]);
};

const onRemove = async (service: Service): Promise<void> => {
  const source = sparkStore.updateSource(service.id);
  await sparkStore.removeService(service.id);
  if (source) {
    source.close();
  }
};

export default {
  install(Vue: VueConstructor) {
    installFilters(Vue);

    autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));
    autoRegister(require.context('./provider', true, /[A-Z]\w+\.vue$/));

    Object.values(features)
      .forEach(feature => featureStore.createFeature(feature.feature));

    Object.values(arrangements)
      .forEach(arr => featureStore.createArrangement(arr));

    const specs = Object.values(features)
      .filter(spec => !!spec.block)
      .map(spec => spec.block) as BlockSpec[];

    sparkStore.commitAllSpecs(specs);

    providerStore.createProvider({
      id: typeName,
      displayName: 'Spark Controller',
      features: Object.keys(features),
      onAdd: onAdd,
      onRemove: onRemove,
      onFetch: (service: Service) => sparkStore.fetchAll(service.id),
      wizard: 'SparkWizard',
      page: 'SparkPage',
      watcher: 'SparkWatcher',
    });
  },
};
