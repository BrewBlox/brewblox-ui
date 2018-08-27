import { Block } from '../state';

export interface SysInfoBlock extends Block {
  data: {
    deviceId: string;
  }
}
