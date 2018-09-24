import { Block } from '@/plugins/spark/state';

export interface OneWireBusBlock extends Block {
  data: {
    command: {
      opcode: number,
      data: number,
    },
    address: string[],
  };
}

export interface ProfilesBlock extends Block {
  data: {
    active: number[],
  };
}

export interface SysInfoBlock extends Block {
  data: {
    deviceId: string;
  };
}

export interface TicksBlock extends Block {
  data: {
    millisSinceBoot: number,
    secondsSinceEpoch: number,
  };
}
