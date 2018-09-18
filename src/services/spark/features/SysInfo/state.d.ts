import { Block } from '@/services/spark/state';

export interface SysInfoBlock extends Block {
  data: {
    deviceId: string;
  };
}
