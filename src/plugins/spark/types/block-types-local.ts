export interface ChannelMapping {
  id: string;
  nid: number;
  name: string;
}

export interface DisplayOpts {
  color: string;
  name: string;
  pos?: number;
  unique: boolean;
  showNotify: boolean;
  showDialog: boolean;
}

export interface ExpressionError {
  index: number;
  message: string;
  indicator: string;
}
