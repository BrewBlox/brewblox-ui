import { Block } from '@/store/blocks/state';

export interface SysInfoBlock extends Block {
  data: {
    deviceId: string;
  };
}
