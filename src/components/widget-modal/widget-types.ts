import { RootStore } from '@/store/state';
import { Block } from '@/store/blocks/state';
import { DeviceService } from '@/store/services/state';

import { getAll as getAllPIDs } from '@/store/blocks/PID/getters';
import { getAll as getAllOneWireTempSensors } from '@/store/blocks/OneWireTempSensor/getters';
import { getAll as getAllSetPointSimples } from '@/store/blocks/SetPointSimple/getters';
import { getAll as getAllSensorSetpointPairs } from '@/store/blocks/SensorSetPointPair/getters';
import { deviceServices } from '@/store/services/getters';

export const widgetTypes: { [key: string]: string } = {
  Metrics: 'Metrics',
  PID: 'PID',
  OneWireTempSensor: 'Temperature Sensor',
  SetPointSimple: 'SetPoint',
  SensorSetPointPair: 'Sensor SetPoint Pair',
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

export function blocksByWidgetType(store: RootStore, type: WidgetType): Block[] {
  const services = deviceServices(store);

  switch (type) {
    case 'PID':
      return getBlocksFromServices(services, store, getAllPIDs);
    case 'OneWireTempSensor':
      return getBlocksFromServices(services, store, getAllOneWireTempSensors);
    case 'SetPointSimple':
      return getBlocksFromServices(services, store, getAllSetPointSimples);
    case 'SensorSetPointPair':
      return getBlocksFromServices(services, store, getAllSensorSetpointPairs);
    default:
      return [];
  }
}

export const widgetComponents: { [name in WidgetType]: () => Promise<any> } = {
  Metrics: () => import('@/components/widgets/Metrics/Create.vue'),
  PID: () => import('@/components/blocks/PID/Create.vue'),
  OneWireTempSensor: () => import('@/components/blocks/OneWireTempSensor/Create.vue'),
  SetPointSimple: () => import('@/components/blocks/SetPointSimple/Create.vue'),
  SensorSetPointPair: () => import('@/components/blocks/SensorSetPointPair/Create.vue'),
};
