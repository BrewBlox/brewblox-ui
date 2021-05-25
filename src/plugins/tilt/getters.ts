import { TiltFieldIndex } from './types';

export const fieldLabels: Record<keyof TiltFieldIndex, string> = {
  temperature: 'Temperature',
  calibratedTemperature: 'Temperature (calibrated)',
  specificGravity: 'SG',
  calibratedSpecificGravity: 'SG (calibrated)',
  plato: 'Plato',
  calibratedPlato: 'Plato (calibrated)',
  signalStrength: 'Signal strength',
  timestamp: 'Published',
  color: 'Color',
};

export const colorOpts: SelectOption<string>[] =
  [
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
    .map(v => ({ label: v, value: v }));
