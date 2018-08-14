import { updateBlockState, addBlock } from '../mutations';
import { PID, PIDUpdate } from './PID';
import { saveBlock, updateBlock } from '../actions';

import { RootStore } from '../../state';
import { BlocksContext } from '../state';

export const addPID = (
  context: BlocksContext,
  {
    id,
    serviceId,
    profiles,
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
      profiles,
      settings,
      links,
      filtering,
      state,
      type: 'Pid',
    },
  );
};

export const update = (store: RootStore, pid: { id: string, serviceId: string } & any) => {
  try {
    updateBlock(store, pid);
  } catch (e) {
    throw new Error(e);
  }
};

// example refresh action
export const refresh = (store: RootStore, pid: PID) => {
  function random() {
    return Math.round(Math.random() * 100);
  }

  // assign new random state
  updateBlockState(store, {
    id: pid.id,
    serviceId: pid.serviceId,
    profiles: pid.profiles,
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

export const persist = async (store: RootStore, pid: PIDUpdate) => {
  try {
    await saveBlock(store, pid);
  } catch (e) {
    throw new Error(e);
  }
};
