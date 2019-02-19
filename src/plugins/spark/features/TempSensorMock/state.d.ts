import { Unit } from '@/helpers/units';
import { Block } from '@/plugins/spark/state';

export interface TempSensorMockBlock extends Block {
  data: {
    value: Unit;
    connected: boolean;
  };
}
