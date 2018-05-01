import { Block } from '@/store/blocks/state';
import { getAll as getAllOneWireTempSensors } from '@/store/blocks/OneWireTempSensor/getters';
import { deviceServices } from '@/store/services/getters';

export const widgetTypes: { [name: string]: string } = {
  pid: 'PID',
  sensor: 'Sensor value',
  setpoint: 'SetPoint',
};

export function blocksByWidgetType(store, type: string): Block[] {
  const services = deviceServices(store);

  switch (type) {
    case 'sensor':
      return getAllOneWireTempSensors(store);
    default:
      return [];
  }
}
