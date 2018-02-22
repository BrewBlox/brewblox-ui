import store from '../../';

import { commitAddBlock } from '../mutations';
import { SetPoint } from './setpoint';

export const addSetPoint = ({ id, controllerId, setting }: SetPoint) => {
  commitAddBlock(store, { id, controllerId, setting, type: 'setpoint' });
};
