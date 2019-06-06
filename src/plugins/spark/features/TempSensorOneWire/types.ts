import { Unit } from '@/helpers/units';
import { Block } from '@/plugins/spark/types';

export interface TempSensorOneWireBlock extends Block {
  data: {
    value: Unit;
    offset: Unit;
    address: string;
  };
}
