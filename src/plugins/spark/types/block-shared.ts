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

export interface IoChannel {
  config: ChannelConfig;
  state: DigitalState;
}

export interface IoPin {
  [id: string]: IoChannel;
}

export interface DisplayOpts {
  color: string;
  name: string;
  pos?: number;
  unique: boolean;
  showNotify: boolean;
  showDialog: boolean;
}
