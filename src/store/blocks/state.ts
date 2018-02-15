import { SetPointsState } from './setpoints/state';

export interface BlockBase {
  id: string,
}

export interface Block extends BlockBase {
  type: 'setpoint' | 'pid' | 'sensor',
};

export type BlocksState = {
  blocks: Block[],
  setpoints: SetPointsState,
};
