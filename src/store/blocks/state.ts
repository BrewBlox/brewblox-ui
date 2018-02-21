import { SetPointBlock } from './setpoints/setpoint';

export interface BlockBase {
  id: string,
}

export type Block = SetPointBlock;

export type BlocksState = {
  blocks: string[],
  byId: {
    [id: string]: SetPointBlock;
  },
};
