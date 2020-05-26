import { BlockBase, IoPin } from '@/plugins/spark/types';

export interface MockPinsData {
  pins: IoPin[];
}

export interface MockPinsBlock extends BlockBase {
  type: 'MockPins';
  data: MockPinsData;
}
