import { Widget } from '@/store/dashboards';

import { EventControlValueRange, EventControlValueType } from '../types';

export interface EventControlledConfig {
  deviceId: string | null;
}

export interface StateValue {
  id: string;

  key: string;
  value: string | number | null;

  label: string;
  type: EventControlValueType;

  unit: string;
  range: EventControlValueRange | null;
  precision: number | null;

  choices: string[] | null;
}

export type EventControlledWidget = Widget<EventControlledConfig>;
