import store from '../../';

import { commitAddBlock } from '../mutations';
import { SetPointSimple } from './SetPointSimple';

export const addSetPoint = ({ id, settings }: SetPointSimple) => {
  commitAddBlock(store, { id, settings, type: 'SetPointSimple' });
};
