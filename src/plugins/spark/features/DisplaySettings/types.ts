import { BlockBase, DisplaySlot } from '@/plugins/spark/types';

export enum DisplayTempUnit {
  Celsius = 0,
  Fahrenheit = 1,
}

export interface DisplaySettingsData {
  name: string;
  tempUnit: DisplayTempUnit;
  widgets: DisplaySlot[];
  brightness: number;
}

export interface DisplaySettingsBlock extends BlockBase {
  type: 'DisplaySettings';
  data: DisplaySettingsData;
}
