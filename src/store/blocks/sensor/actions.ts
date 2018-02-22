import store from '../../';

import { commitAddBlock } from '../mutations';
import { Sensor } from './sensor';

export const addSensor = ({ id, controllerId, value }: Sensor) => {
  commitAddBlock(store, { id, controllerId, value, type: 'sensor' });
};
