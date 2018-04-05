import { Store } from 'vuex';

import { addBlock } from '../mutations';
import { PID } from './PID';
import { saveBlock } from '../actions';

import { State } from '../../state';
import { BlocksContext } from '../state';

export const addPID = (context: BlocksContext, { id, settings, links, filtering, state }: PID) => {
  addBlock(context, { id, settings, links, filtering, state, type: 'PID' });
};

export const persist = async (store: Store<State>, pid: PID) => {
  try {
    await saveBlock(store, pid);
  } catch (e) {
    throw new Error(e);
  }
};
