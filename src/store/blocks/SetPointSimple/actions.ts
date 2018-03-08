import store from '../../';

import { commitAddBlock } from '../mutations';
import { SetPointSimple } from './SetPointSimple';
import { persistBlock } from '../actions';

export const addSetPoint = ({ id, settings }: SetPointSimple) => {
  commitAddBlock(store, { id, settings, type: 'SetPointSimple' });
};

export const persist = (setPointSimple: SetPointSimple) => {
  persistBlock(setPointSimple);
};
