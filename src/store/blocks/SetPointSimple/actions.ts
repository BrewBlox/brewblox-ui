import store from '../../';

import { commitAddBlock } from '../mutations';
import { SetPointSimple } from './SetPointSimple';

export const addSetPoint = ({ id, setting }: SetPointSimple) => {
  commitAddBlock(store, { id, setting, type: 'setpoint' });
};
