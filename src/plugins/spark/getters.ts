import { ChannelConfig } from './types';

export const sparkType = 'Spark';

export const configName = (val: ChannelConfig): string => ChannelConfig[val];
