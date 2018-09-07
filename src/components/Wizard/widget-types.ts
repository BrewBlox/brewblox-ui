import { RootStore } from '@/store/state';
import { Block } from '@/store/blocks/state';
import { DeviceService } from '@/store/services/state';

import { deviceServices } from '@/store/services/getters';
import { allBlocksFromService } from '@/store/blocks/getters';
import { VueConstructor } from 'vue';

import { allTypes, wizardByType, displayNameByType } from '@/features/feature-by-type';

function getBlocksFromServices(
  services: DeviceService[],
  store: RootStore,
  type: string,
): Block[] {
  return services
    .map(service => allBlocksFromService(store, service.id, type))
    .reduce((acc, sensors) => [...acc, ...sensors], []);
}

export function blocksByWidgetType(store: RootStore, type: string): Block[] {
  const services = deviceServices(store);
  return getBlocksFromServices(services, store, type);
}

export const widgetWizards: { [name: string]: VueConstructor } = allTypes
  .filter(wizardByType)
  .reduce(
    (coll: any, type: string) => {
      coll[type] = wizardByType(type);
      return coll;
    },
    {},
  );

export const widgetDescriptions: { [name: string]: string } = allTypes
  .reduce(
    (coll: any, type: string) => {
      coll[type] = displayNameByType(type);
      return coll;
    },
    {},
  );
