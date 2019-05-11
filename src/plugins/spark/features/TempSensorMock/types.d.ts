import { Unit } from '@/helpers/units';
import { Block } from '@/plugins/spark/types';

export interface TempSensorMockBlock extends Block {
  data: {
    value: Unit;
    connected: boolean;
  };
}
