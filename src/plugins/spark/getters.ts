import {
  AnalogConstraintKey,
  ChannelConfig,
  DigitalConstraintKey,
  UserUnitKey,
} from './types';

export const sparkType = 'Spark';
export const sparkBlocksEvent = 'Spark.blocks';
export const sparkStatusEvent = 'Spark.service';
export const sparkUpdateEvent = 'Spark.update';

export const userUnitChoices: Record<UserUnitKey, string[]> = {
  Temp: [
    'degC',
    'degF',
    'degK',
  ],
  Time: [
    'millisecond',
    'second',
    'minute',
    'hour',
  ],
  LongTime: [
    'hour',
    'day',
  ],
};

export const digitalConstraintLabels: Record<DigitalConstraintKey, string> = {
  minOff: 'Minimum OFF time',
  minOn: 'Minimum ON time',
  mutexed: 'Mutually exclusive',
  delayedOff: 'Delay OFF',
  delayedOn: 'Delay ON',
};

export const analogConstraintLabels: Record<AnalogConstraintKey, string> = {
  min: 'Minimum',
  max: 'Maximum',
  balanced: 'Balanced',
};

export const constraintLabels = {
  ...digitalConstraintLabels,
  ...analogConstraintLabels,
};

export const configName = (val: ChannelConfig): string => ChannelConfig[val];
