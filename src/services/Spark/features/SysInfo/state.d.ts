import { Block } from '@/services/Spark/state';

export interface SysInfoBlock extends Block {
  data: {
    deviceId: string;
  };
}
