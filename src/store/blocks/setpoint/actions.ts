import store from '../../';

import { addBlock } from '../mutations';
import { SetPoint } from './setpoint';

export const addSetPoint = ({ id, value, setting }: SetPoint) => {
  addBlock(store, { id, value, setting, type: 'setpoint' });
};
