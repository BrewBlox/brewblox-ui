import { Block } from '@/services/SparkService/state';

export interface OneWireBusBlock extends Block {
  data: {
    command: {
      opcode: number,
      data: number,
    },
    address: string[],
  };
}
