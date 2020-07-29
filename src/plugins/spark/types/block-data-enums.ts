import { Enum } from 'typescript-string-enums';

export const ChannelConfig = Enum(
  'CHANNEL_UNUSED',
  'CHANNEL_ACTIVE_LOW',
  'CHANNEL_ACTIVE_HIGH',
  'CHANNEL_INPUT',
  'CHANNEL_UNKNOWN',
);
export type ChannelConfig = Enum<typeof ChannelConfig>;


export const DigitalState = Enum(
  'STATE_INACTIVE',
  'STATE_ACTIVE',
  'STATE_UNKNOWN',
);
export type DigitalState = Enum<typeof DigitalState>;


export const DigitalCompareOp = Enum(
  'OP_VALUE_IS',
  'OP_VALUE_IS_NOT',
  'OP_DESIRED_IS',
  'OP_DESIRED_IS_NOT'
);
export type DigitalCompareOp = Enum<typeof DigitalCompareOp>;


export const AnalogCompareOp = Enum(
  'OP_VALUE_LE',
  'OP_VALUE_GE',
  'OP_SETTING_LE',
  'OP_SETTING_GE',
);
export type AnalogCompareOp = Enum<typeof AnalogCompareOp>;


export const LogicResult = Enum(
  'RESULT_FALSE',
  'RESULT_TRUE',
  'RESULT_EMPTY',
  'RESULT_EMPTY_SUBSTRING',
  'RESULT_BLOCK_NOT_FOUND',
  'RESULT_INVALID_DIGITAL_OP',
  'RESULT_INVALID_ANALOG_OP',
  'RESULT_UNDEFINED_DIGITAL_COMPARE',
  'RESULT_UNDEFINED_ANALOG_COMPARE',
  'RESULT_UNEXPECTED_OPEN_BRACKET',
  'RESULT_UNEXPECTED_CLOSE_BRACKET',
  'RESULT_UNEXPECTED_CHARACTER',
  'RESULT_UNEXPECTED_COMPARISON',
  'RESULT_UNEXPECTED_OPERATOR',
  'RESULT_MISSING_CLOSE_BRACKET',
);
export type LogicResult = Enum<typeof LogicResult>;


export const ReferenceKind = Enum(
  'REF_SETTING',
  'REF_VALUE',
);
export type ReferenceKind = Enum<typeof ReferenceKind>;


export const DisplayTempUnit = Enum(
  'TEMP_CELSIUS',
  'TEMP_FAHRENHEIT',
);
export type DisplayTempUnit = Enum<typeof DisplayTempUnit>;


export const ValveState = Enum(
  'VALVE_UNKNOWN',
  'VALVE_OPEN',
  'VALVE_CLOSED',
  'VALVE_OPENING',
  'VALVE_CLOSING',
  'VALVE_HALF_OPEN_IDLE',
  'VALVE_INIT_IDLE',
);
export type ValveState = Enum<typeof ValveState>;


export const FilterChoice = Enum(
  'FILTER_NONE',
  'FILTER_15s',
  'FILTER_45s',
  'FILTER_90s',
  'FILTER_3m',
  'FILTER_10m',
  'FILTER_30m',
);
export type FilterChoice = Enum<typeof FilterChoice>;


export const Spark2Hardware = Enum(
  'HW_UNKNOWN',
  'HW_SPARK1',
  'HW_SPARK2',
);
export type Spark2Hardware = Enum<typeof Spark2Hardware>;


export const SparkPlatform = Enum(
  'PLATFORM_UNKNOWN',
  'PLATFORM_GCC',
  'PLATFORM_PHOTON',
  'PLATFORM_P1',
);
export type SparkPlatform = Enum<typeof SparkPlatform>;

export const TouchCalibrated = Enum(
  'CALIBRATED_NO',
  'CALIBRATED_YES',
  'CALIBRATED_NEW',
);
export type TouchCalibrated = Enum<typeof TouchCalibrated>;

export const WifiSecurityType = Enum(
  'WLAN_SEC_UNSEC',
  'WLAN_SEC_WEP',
  'WLAN_SEC_WPA',
  'WLAN_SEC_WPA2',
  'WLAN_SEC_WPA_ENTERPRISE',
  'WLAN_SEC_WPA2_ENTERPRISE',
  'WLAN_SEC_NOT_SET',
);
export type WifiSecurityType = Enum<typeof WifiSecurityType>;

export const WifiCipherType = Enum(
  'WLAN_CIPHER_NOT_SET',
  'WLAN_CIPHER_AES',
  'WLAN_CIPHER_TKIP',
  'WLAN_CIPHER_AES_OR_TKIP',
);
export type WifiCipherType = Enum<typeof WifiCipherType>;
