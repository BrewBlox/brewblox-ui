export type EventControlValueType = 'string' | 'number' | 'enum';

export interface EventControlValueRange {
  min?: number;
  max?: number;
  step?: number;
}

export interface EventControlDevice {
  id: string;
  title?: string;
  desc?: string;
  fields: string[];
  editable?: boolean;

  // shared
  valueName?: string | Mapped<string>;
  valueType?: EventControlValueType | Mapped<EventControlValueType>;

  // if numeric value
  unit?: string | Mapped<string>;
  range?: EventControlValueRange | Mapped<EventControlValueRange>;
  precision?: number | Mapped<number>;

  // if enum value
  choices?: string[] | Mapped<string[]>;
}

export interface EventControlDeviceState {
  id: string;
  values: Mapped<string | number>;
  desiredValues?: Mapped<string | number>;
}
