import { AnalogConstraintKey, ChannelConfig, DigitalConstraintKey } from './types';

export const sparkType = 'Spark';
export const sparkBlocksEvent = 'Spark.blocks';
export const sparkStatusEvent = 'Spark.service';


export const digitalConstraintLabels: Record<DigitalConstraintKey, string> = {
  minOff: 'Minimum OFF time',
  minOn: 'Minimum ON time',
  mutexed: 'Mutually exclusive',
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
