import { Block } from '@/services/spark/state';

export interface OneWireBusBlock extends Block {
  data: {
    command: {
      opcode: number,
      data: number,
    },
    address: string[],
  };
}
