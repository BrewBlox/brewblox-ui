import { Block } from '@/store/blocks/state';

export const widgetTypes: { [name: string]: string } = {
  pid: 'PID',
  sensor: 'Sensor value',
  setpoint: 'SetPoint',
};

export function blocksByWidgetType(type: string): Block[] {
  return [];
}
