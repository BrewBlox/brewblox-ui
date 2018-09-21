import { Block } from '@/services/Spark/state';
import { Unit } from '@/helpers/units';

export interface TempSensorOneWireBlock extends Block {
  data: {
    value: Unit,
    valid: boolean,
    offset: Unit,
    address: string,
  };
}
