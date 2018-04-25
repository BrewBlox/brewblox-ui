import { Store } from 'vuex';

import { updateBlockState, addBlock } from '../mutations';
import { PID, PIDUpdate } from './PID';
import { saveBlock, updateBlock } from '../actions';

import { State } from '../../state';
import { BlocksContext } from '../state';

export const addPID = (
  context: BlocksContext,
  {
    id,
    serviceId,
    settings,
    links,
    filtering,
    state,
  }: PID,
) => {
  addBlock(
    context,
    {
      id,
      serviceId,
      settings,
      links,
      filtering,
      state,
      type: 'PID',
    },
  );
};

export const update = (store: Store<State>, pid: { id: string } & any) => {
  try {
    updateBlock(store, pid);
  } catch (e) {
    throw new Error(e);
  }
};

// example refresh action
export const refresh = (store: Store<State>, pid: PID) => {
  function random() {
    return Math.round(Math.random() * 100);
  }

  // assign new random state
  updateBlockState(store, {
    id: pid.id,
    serviceId: pid.serviceId,
    state: {
      inputValue: random(),
      inputSetting: random(),
      outputValue: random(),
      outputSetting: random(),
      p: random(),
      i: random(),
      d: random(),
      derivative: random(),
      integral: random(),
      error: random(),
    },
  });
};

export const persist = async (store: Store<State>, pid: PIDUpdate) => {
  try {
    await saveBlock(store, pid);
  } catch (e) {
    throw new Error(e);
  }
};
