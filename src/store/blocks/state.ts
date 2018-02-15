import { SetPoint } from './setpoints/state';

export interface BlockBase {
  id: string,
}

export interface Block extends BlockBase {
  type: 'setpoint' | 'pid' | 'sensor',
}

export type BlocksState = {
  blocks: BlockBase[],
  byId: {
    [id: string]: SetPoint
  },
};
