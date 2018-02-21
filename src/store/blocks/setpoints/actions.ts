import store from '../../';

import { addBlock } from '../mutations';

export const addSetPoint = ({ id, value }: any) => {
  addBlock(store, {
    block: { id, type: 'setpoint' },
    data: { value },
  });
};
