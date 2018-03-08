import { addBlock } from '../mutations';
import { SetPointSimple } from './SetPointSimple';
import { persistBlock } from '../actions';

export const addSetPoint = ({ id, settings }: SetPointSimple) => {
  addBlock({ id, settings, type: 'SetPointSimple' });
};

export const persist = (setPointSimple: SetPointSimple) => {
  persistBlock(setPointSimple);
};
