import { addBlock } from '../mutations';
import { SetPointSimple } from './SetPointSimple';
import { saveBlock } from '../actions';

export const addSetPoint = ({ id, settings }: SetPointSimple) => {
  addBlock({ id, settings, type: 'SetPointSimple' });
};

export const persist = async (setPointSimple: SetPointSimple) => {
  try {
    await saveBlock(setPointSimple);
  } catch (e) {
    throw new Error(e);
  }
};
