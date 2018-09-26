import { Block } from '@/plugins/spark/state';
import { Unit } from '@/helpers/units';

export interface TempSensorMockBlock extends Block {
  data: {
    value: Unit,
    valid: boolean,
    connected: boolean,
  };
}
