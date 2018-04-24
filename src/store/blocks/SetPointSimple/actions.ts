import { Store } from 'vuex';

import { addBlock } from '../mutations';
import { SetPointSimple } from './SetPointSimple';
import { saveBlock } from '../actions';

import { State } from '../../state';
import { BlocksContext } from '../state';

export const addSetPoint = (context: BlocksContext, { id, settings }: SetPointSimple) => {
  addBlock(context, { id, settings, type: 'SetPointSimple' });
};

export const persist = async (store: Store<State>, setPointSimple: SetPointSimple) => {
  try {
    await saveBlock(store, setPointSimple);
  } catch (e) {
    throw new Error(e);
  }
};
