import store from '../../';

import { commitAddBlock } from '../mutations';
import { SetPoint } from './setpoint';

export const addSetPoint = ({ id, value, setting }: SetPoint) => {
  commitAddBlock(store, { id, value, setting, type: 'setpoint' });
};
