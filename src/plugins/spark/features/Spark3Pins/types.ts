import { BlockBase, IoPin } from '@/plugins/spark/types';

export enum Spark3PinId {
  top1 = 1,
  top2 = 2,
  top3 = 3,
  bottom1 = 4,
  bottom2 = 5,
}

export interface Spark3PinsData {
  pins: IoPin[];
  enableIoSupply5V: boolean;
  enableIoSupply12V: boolean;
  soundAlarm: boolean;
  voltage5: number;
  voltage12: number;
}

export interface Spark3PinsBlock extends BlockBase {
  type: 'Spark3Pins';
  data: Spark3PinsData;
}
