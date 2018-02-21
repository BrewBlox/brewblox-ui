import store from '../../';

import { BlocksContext, addBlock } from '../';

export const setpoints = {
  actions: {
    addSetpoint(context: BlocksContext, { id, value }: any) {
      addBlock(store, {
        block: { id, type: 'setpoint' },
        data: { value },
      });
    },
  },
};
