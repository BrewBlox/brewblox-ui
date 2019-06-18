import { Link } from '@/helpers/units';
import { Block } from '@/plugins/spark/types';

export interface DisplaySlot {
  pos: number;
  color: string;
  name: string;

  // Value will be one of these
  tempSensor?: Link;
  setpointSensorPair?: Link;
  actuatorAnalog?: Link;
  pid?: Link;
}

export enum DisplayTempUnit {
  Celsius = 0,
  Fahrenheit = 1,
}

export interface DisplaySettingsData {
  name: string;
  tempUnit: DisplayTempUnit;
  widgets: DisplaySlot[];
}

export interface DisplaySettingsBlock extends Block {
  data: DisplaySettingsData;
}
