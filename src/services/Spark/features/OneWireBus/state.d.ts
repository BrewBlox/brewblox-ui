import { Block } from '@/services/Spark/state';

export interface OneWireBusBlock extends Block {
  data: {
    command: {
      opcode: number,
      data: number,
    },
    address: string[],
  };
}
