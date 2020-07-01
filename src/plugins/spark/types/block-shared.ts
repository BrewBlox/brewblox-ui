export enum ChannelConfig {
  'UNKNOWN' = 'UNKNOWN',
  'ACTIVE_LOW' = 'ACTIVE_LOW',
  'ACTIVE_HIGH' = 'ACTIVE_HIGH',
  'INPUT' = 'INPUT',
}

export enum DigitalState {
  'Unknown' = 'Unknown',
  'Active' = 'Active',
  'Inactive' = 'Inactive',
}

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
