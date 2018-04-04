import { Store } from 'vuex';

import { addBlock } from '../mutations';
import { SetPointSimple } from './SetPointSimple';
import { saveBlock } from '../actions';

import { State } from '../../state';

export const addSetPoint = ({ id, settings }: SetPointSimple) => {
  addBlock({ id, settings, type: 'SetPointSimple' });
};

export const persist = async (store: Store<State>, setPointSimple: SetPointSimple) => {
  try {
    await saveBlock(store, setPointSimple);
  } catch (e) {
    throw new Error(e);
  }
};
