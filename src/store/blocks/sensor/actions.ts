import store from '../../';

import { addBlock } from '../mutations';
import { Sensor } from './sensor';

export const addSensor = ({ id, value }: Sensor) => {
  addBlock(store, { id, value, type: 'sensor' });
};
