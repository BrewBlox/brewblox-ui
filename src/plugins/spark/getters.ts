import { ChannelConfig } from './types';

export const sparkType = 'Spark';
export const sparkBlocksEvent = 'Spark.blocks';
export const sparkStatusEvent = 'Spark.service';

export const configName = (val: ChannelConfig): string => ChannelConfig[val];
