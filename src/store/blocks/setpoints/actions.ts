import store from '../../';

import { addBlock } from '../mutations';
import { SetPoint } from './setpoint';

export const addSetPoint = ({ id, value }: SetPoint) => {
  addBlock(store, { id, value, type: 'setpoint' });
};
