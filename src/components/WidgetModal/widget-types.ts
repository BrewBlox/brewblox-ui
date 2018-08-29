import { RootStore } from '@/store/state';
import { Block } from '@/store/blocks/state';
import { DeviceService } from '@/store/services/state';

import { deviceServices } from '@/store/services/getters';
import { allBlocksFromService } from '@/store/blocks/getters';

export const widgetTypes: { [key in WidgetType]: string } = {
  Metrics: 'Metrics',
  Pid: 'Pid',
  OneWireTempSensor: 'Temperature Sensor',
  SetPointSimple: 'Setpoint',
  SensorSetPointPair: 'Sensor/Setpoint Pair',
};

function getBlocksFromServices(
  services: DeviceService[],
  store: RootStore,
  type: string,
): Block[] {
  return services
    .map(service => allBlocksFromService(store, service.id, type))
    .reduce((acc, sensors) => [...acc, ...sensors], []);
}

export function blocksByWidgetType(store: RootStore, type: WidgetType): Block[] {
  const services = deviceServices(store);
  return getBlocksFromServices(services, store, type);
}

export const widgetComponents: { [name in WidgetType]: () => Promise<any> } = {
  Metrics: () => import('@/components/Metrics/CreateMetrics.vue'),
  Pid: () => import('@/features/Pid/CreatePid.vue'),
  OneWireTempSensor: () => import('@/features/OneWireTempSensor/CreateOneWireTempSensor.vue'),
  SetPointSimple: () => import('@/features/SetPointSimple/CreateSetPointSimple.vue'),
  SensorSetPointPair: () => import('@/features/SensorSetPointPair/CreateSensorSetPointPair.vue'),
};
