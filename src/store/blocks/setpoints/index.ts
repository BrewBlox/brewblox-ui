import { BlocksContext } from '../';

import { addBlock } from '../mutations';

export const setpoints = {
  actions: {
    addSetpoint(context: BlocksContext, { id, value }: any) {
      addBlock(this, { id, type: 'setpoint', value });
    },
  },
};
