import { TiltFieldIndex } from './types';

export const fieldLabels: Record<keyof TiltFieldIndex, string> = {
  temperature: 'Temperature',
  uncalibratedTemperature: 'Temperature (uncalibrated)',
  specificGravity: 'SG',
  uncalibratedSpecificGravity: 'SG (uncalibrated)',
  plato: 'Plato',
  uncalibratedPlato: 'Plato (uncalibrated)',
  rssi: 'Signal strength',
  timestamp: 'Published',
  color: 'Color',
  mac: 'MAC address',
  name: 'Device name',
};

export const colorOpts: SelectOption<string>[] = [
  'Red',
  'Green',
  'Black',
  'Purple',
  'Orange',
  'Blue',
  'Yellow',
  'Pink',
]
  .sort()
  .map((v) => ({ label: v, value: v }));
