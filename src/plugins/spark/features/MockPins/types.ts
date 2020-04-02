import { Block, IoPin } from '@/plugins/spark/types';

export interface MockPinsData {
  pins: IoPin[];
}

export interface MockPinsBlock extends Block {
  data: MockPinsData;
}
