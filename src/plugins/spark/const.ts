import {
  AnalogCompareOp,
  AnalogConstraintKey,
  AnalogSensorType,
  AnyConstraintKey,
  DigitalCompareOp,
  DigitalConstraintKey,
  DigitalState,
  DisplayTempUnit,
  FilterChoice,
  LogicResult,
  PwmFrequency,
  SensorCombiFunc,
  SequenceStoreMode,
  TempSensorAnalogSpec,
  TempSensorAnalogType,
  TransitionDurationPreset,
  ValveState,
} from 'brewblox-proto/ts';
import { durationString } from '@/utils/quantity';

type EnumLabels<T extends keyof any> = Record<T, string>;

export const SPARK_SERVICE_TYPE = 'Spark';

export const ENUM_LABELS_DIGITAL_CONSTRAINT: EnumLabels<DigitalConstraintKey> =
  {
    minOff: 'Minimum OFF time',
    minOn: 'Minimum ON time',
    mutexed: 'Mutually exclusive',
    delayedOff: 'Delay OFF',
    delayedOn: 'Delay ON',
  };

export const ENUM_LABELS_ANALOG_CONSTRAINT: EnumLabels<AnalogConstraintKey> = {
  min: 'Minimum',
  max: 'Maximum',
  balanced: 'Balanced',
};

export const ENUM_LABELS_ANY_CONSTRAINT: EnumLabels<AnyConstraintKey> = {
  ...ENUM_LABELS_DIGITAL_CONSTRAINT,
  ...ENUM_LABELS_ANALOG_CONSTRAINT,
};

export const FILTER_SAMPLES: Record<FilterChoice, number> = {
  FILTER_NONE: 0,
  SETTLE_IN_13_SAMPLES: 13,
  SETTLE_IN_47_SAMPLES: 47,
  SETTLE_IN_112_SAMPLES: 112,
  SETTLE_IN_241_SAMPLES: 241,
  SETTLE_IN_649_SAMPLES: 649,
  SETTLE_IN_1876_SAMPLES: 1876,
};

export function filterLabel(
  choice: FilterChoice,
  updateIntervalMs: number | null = null,
): string {
  if (choice === FilterChoice.FILTER_NONE) return 'No filtering';
  const samples = FILTER_SAMPLES[choice];
  if (updateIntervalMs != null && updateIntervalMs > 0) {
    const responseMs = samples * updateIntervalMs;
    return `${samples} samples (~${durationString(responseMs, false)})`;
  }
  return `${samples} samples`;
}

export function derivativeFilterLabel(
  choice: FilterChoice,
  updateIntervalMs: number | null = null,
): string {
  if (choice === FilterChoice.FILTER_NONE) return 'Derived from Td';
  return filterLabel(choice, updateIntervalMs);
}

export function filterSelectOptions(
  updateIntervalMs: number | null = null,
): SelectOption<FilterChoice>[] {
  return Object.keys(FILTER_SAMPLES).map((key) => ({
    label: filterLabel(key as FilterChoice, updateIntervalMs),
    value: key as FilterChoice,
  }));
}

export function derivativeFilterSelectOptions(
  updateIntervalMs: number | null = null,
): SelectOption<FilterChoice>[] {
  return Object.keys(FILTER_SAMPLES).map((key) => ({
    label: derivativeFilterLabel(key as FilterChoice, updateIntervalMs),
    value: key as FilterChoice,
  }));
}

export const ENUM_LABELS_COMBINE_FUNC: EnumLabels<SensorCombiFunc> = {
  SENSOR_COMBI_FUNC_AVG: 'Average',
  SENSOR_COMBI_FUNC_MIN: 'Minimum',
  SENSOR_COMBI_FUNC_MAX: 'Maximum',
};

export const ENUM_LABELS_DISPLAY_TEMP: EnumLabels<DisplayTempUnit> = {
  TEMP_CELSIUS: 'Celsius',
  TEMP_FAHRENHEIT: 'Fahrenheit',
};

export const ENUM_LABELS_DIGITAL_STATE: EnumLabels<DigitalState> = {
  STATE_ACTIVE: 'ON',
  STATE_INACTIVE: 'OFF',
  STATE_UNKNOWN: 'UNKNOWN',
  STATE_REVERSE: 'REVERSED',
};

export const ENUM_LABELS_VALVE_STATE: EnumLabels<ValveState> = {
  VALVE_CLOSED: 'Closed',
  VALVE_CLOSING: 'Closing',
  VALVE_HALF_OPEN_IDLE: 'Idle (half open)',
  VALVE_INIT_IDLE: 'Idle',
  VALVE_OPEN: 'Open',
  VALVE_OPENING: 'Opening',
  VALVE_UNKNOWN: 'Unknown',
};

export const ENUM_LABELS_DIGITAL_OP: EnumLabels<DigitalCompareOp> = {
  OP_VALUE_IS: 'Measured state ==',
  OP_VALUE_IS_NOT: 'Measured state !=',
  OP_DESIRED_IS: 'Desired state ==',
  OP_DESIRED_IS_NOT: 'Desired state !=',
};

export const ENUM_LABELS_ANALOG_OP: EnumLabels<AnalogCompareOp> = {
  OP_VALUE_LE: 'Measured value <=',
  OP_VALUE_GE: 'Measured value >=',
  OP_SETTING_LE: 'Setting <=',
  OP_SETTING_GE: 'Setting >=',
};

export const ENUM_LABELS_LOGIC_RESULT: EnumLabels<LogicResult> = {
  RESULT_FALSE: 'Result is OFF',
  RESULT_TRUE: 'Result is ON',
  RESULT_EMPTY: 'Expression empty: result is OFF',
  RESULT_EMPTY_SUBSTRING: 'Empty sub-expression',
  RESULT_BLOCK_NOT_FOUND: 'Block not found',
  RESULT_INVALID_DIGITAL_OP: 'Invalid operator',
  RESULT_INVALID_ANALOG_OP: 'Invalid operator',
  RESULT_UNDEFINED_ANALOG_COMPARE: 'Invalid analog comparison',
  RESULT_UNDEFINED_DIGITAL_COMPARE: 'Invalid digital comparison',
  RESULT_UNEXPECTED_OPEN_BRACKET: 'Unexpected opening bracket',
  RESULT_UNEXPECTED_CLOSE_BRACKET: 'Unexpected closing bracket',
  RESULT_UNEXPECTED_CHARACTER: 'Unexpected character',
  RESULT_UNEXPECTED_COMPARISON: 'Unexpected comparison',
  RESULT_UNEXPECTED_OPERATOR: 'Unexpected operator',
  RESULT_MISSING_CLOSE_BRACKET: 'Missing closing bracket',
};

export const ENUM_LABELS_TRANSITION_PRESET: EnumLabels<TransitionDurationPreset> =
  {
    ST_OFF: 'Off',
    ST_FAST: 'Fast',
    ST_MEDIUM: 'Medium',
    ST_SLOW: 'Slow',
    ST_CUSTOM: 'Custom',
  };

export const ENUM_LABELS_PWM_FREQUENCY: EnumLabels<PwmFrequency> = {
  PWM_FREQ_80HZ: '80Hz',
  PWM_FREQ_100HZ: '100Hz',
  PWM_FREQ_200HZ: '200Hz',
  PWM_FREQ_2000HZ: '2000Hz',
};

export const PWM_SELECT_OPTIONS: SelectOption<number>[] = [
  { label: '0%', value: 0 },
  { label: '25%', value: 25 },
  { label: '50%', value: 50 },
  { label: '75%', value: 75 },
  { label: '100%', value: 100 },
];

export const ENUM_LABELS_STORE_MODE: EnumLabels<SequenceStoreMode> = {
  AT_RESTORE_INSTRUCTION_RESTORE_ENABLED: 'Restore previous position',
  AT_RESTORE_INSTRUCTION_ALWAYS_ENABLED:
    'Restore previous position and enable sequence',
  AT_RESTORE_INSTRUCTION_NEVER_ENABLED:
    'Restore previous position and disable sequence',
  AT_FIRST_INSTRUCTION_RESTORE_ENABLED: 'Go to first instruction',
  AT_FIRST_INSTRUCTION_ALWAYS_ENABLED:
    'Go to first instruction and enable sequence',
  AT_FIRST_INSTRUCTION_NEVER_ENABLED:
    'Go to first instruction and disable sequence',
};

export const ENUM_LABELS_TEMP_SENSOR_ANALOG_TYPE: EnumLabels<TempSensorAnalogType> =
  {
    TEMP_SENSOR_TYPE_NOT_SET: 'Not set',
    TEMP_SENSOR_TYPE_RTD_2WIRE: 'RTD (2-wire)',
    TEMP_SENSOR_TYPE_RTD_3WIRE: 'RTD (3-wire)',
    TEMP_SENSOR_TYPE_RTD_4WIRE: 'RTD (4-wire)',
  };

export const ENUM_LABELS_TEMP_SENSOR_ANALOG_SPEC: EnumLabels<TempSensorAnalogSpec> =
  {
    SPEC_NOT_SET: 'Not set',
    SPEC_PT100_385: 'PT100 (385)',
    SPEC_PT100_392: 'PT100 (392)',
    SPEC_PT1000_385: 'PT1000 (385)',
    SPEC_PT1000_392: 'PT1000 (392)',
  };

export const ENUM_LABELS_ANALOG_SENSOR_TYPE: EnumLabels<AnalogSensorType> = {
  ANALOG_SENSOR_TYPE_NONE: 'None',
  ANALOG_SENSOR_TYPE_STRAIN_GAUGE: 'Strain gauge',
  ANALOG_SENSOR_TYPE_RTD_2WIRE: 'RTD (2-wire)',
  ANALOG_SENSOR_TYPE_RTD_3WIRE: 'RTD (3-wire)',
  ANALOG_SENSOR_TYPE_RTD_4WIRE: 'RTD (4-wire)',
  ANALOG_SENSOR_TYPE_RTD_3WIRE_LS: 'RTD (3-wire low side)',
  ANALOG_SENSOR_TYPE_STRAIN_GAUGE_LOW_RESISTANCE:
    'Strain gauge (low resistance)',
};
