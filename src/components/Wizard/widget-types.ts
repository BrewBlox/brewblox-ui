import { RootStore } from '@/store/state';
import { Block } from '@/store/blocks/state';
import { Service } from '@/store/services/state';

import { allServices } from '@/store/services/getters';
import { allBlocksFromService } from '@/store/blocks/getters';
import { VueConstructor } from 'vue';

import { allTypes, wizardByType, displayNameByType } from '@/features/feature-by-type';

function getBlocksFromServices(
  services: Service[],
  store: RootStore,
  type: string,
): Block[] {
  return services
    .map(service => allBlocksFromService(store, service.id, type))
    .reduce((acc, sensors) => [...acc, ...sensors], []);
}

export function blocksByWidgetType(store: RootStore, type: string): Block[] {
  const services = allServices(store);
  return getBlocksFromServices(services, store, type);
}

export const widgetWizards: { [name: string]: VueConstructor } = allTypes
  .filter(wizardByType)
  .reduce(
    (acc: any, type: string) => {
      acc[type] = wizardByType(type);
      return acc;
    },
    {},
  );

export const widgetDescriptions: { [name: string]: string } = allTypes
  .reduce(
    (acc: any, type: string) => {
      acc[type] = displayNameByType(type);
      return acc;
    },
    {},
  );
