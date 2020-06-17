export type ChannelConfig =
  'Unknown'
  | 'ActiveLow'
  | 'ActiveHigh'
  | 'Input'

export type DigitalState =
  'Unknown'
  | 'Active'
  | 'Inactive'
  ;

export interface IoChannel {
  config: ChannelConfig;
  state: DigitalState;
}

export interface IoPin {
  [key: string]: IoChannel;
}

export interface DisplayOpts {
  color: string;
  name: string;
  pos?: number;
  unique: boolean;
  showNotify: boolean;
  showDialog: boolean;
}
