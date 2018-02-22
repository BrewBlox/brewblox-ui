import store from '../../';

import { commitAddBlock } from '../mutations';
import { SetPoint } from './setpoint';

export const addSetPoint = ({ id, setting }: SetPoint) => {
  commitAddBlock(store, { id, setting, type: 'setpoint' });
};
