import { Block } from '@/services/SparkService/state';

export interface SysInfoBlock extends Block {
  data: {
    deviceId: string;
  };
}
