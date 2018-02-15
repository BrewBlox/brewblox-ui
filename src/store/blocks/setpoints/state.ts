import { BlockBase } from '../state';

export interface SetPoint extends BlockBase {
  value: number;
}

export interface SetPointsState {
  [id: string]: SetPoint,
}
