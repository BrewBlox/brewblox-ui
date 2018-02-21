import store from '../../';

import { commitAddBlock } from '../mutations';
import { Sensor } from './sensor';

export const addSensor = ({ id, value }: Sensor) => {
  commitAddBlock(store, { id, value, type: 'sensor' });
};
