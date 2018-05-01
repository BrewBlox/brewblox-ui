import { RootStore } from '@/store/state';
import { Block } from '@/store/blocks/state';
import { DeviceService } from '@/store/services/state';

import { getAll as getAllOneWireTempSensors } from '@/store/blocks/OneWireTempSensor/getters';
import { getAll as getAllSetPointSimples } from '@/store/blocks/SetPointSimple/getters';
import { getAll as getAllPIDs } from '@/store/blocks/PID/getters';
import { deviceServices } from '@/store/services/getters';

export const widgetTypes: { [name: string]: string } = {
  pid: 'PID',
  sensor: 'Sensor value',
  setpoint: 'SetPoint',
  setpointpair: 'SetPoint Pair',
};

function getBlocksFromServices(
  services: DeviceService[],
  store: RootStore,
  getter: (store: RootStore, serviceId: string) => Block[],
): Block[] {
  return services
    .map(service => getter(store, service.id))
    .reduce((acc, sensors) => [...acc, ...sensors], []);
}

export function blocksByWidgetType(store: RootStore, type: string): Block[] {
  const services = deviceServices(store);

  switch (type) {
    case 'pid':
      return getBlocksFromServices(services, store, getAllPIDs);
    case 'setpoint':
      return getBlocksFromServices(services, store, getAllSetPointSimples);
    case 'sensor':
      return getBlocksFromServices(services, store, getAllOneWireTempSensors);
    default:
      return [];
  }
}
