import { BlockBase, IoPin } from '@/plugins/spark/types';

export enum Spark2PinId {
  bottom1 = 1,
  bottom2 = 2,
  bottom3 = 3,
  bottom0 = 4,
}

export enum Spark2Hardware {
  Unknown = 0,
  Spark1 = 1,
  SPark2 = 2,
}

export interface Spark2PinsData {
  pins: IoPin[];
  soundAlarm: boolean;
  hardware: Spark2Hardware;
}

export interface Spark2PinsBlock extends BlockBase {
  type: 'Spark2Pins';
  data: Spark2PinsData;
}
