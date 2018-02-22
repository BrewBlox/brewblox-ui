import store from '../../';

import { commitAddBlock } from '../mutations';
import { OneWireTempSensor } from './onewiretempsensor';

export const addOneWireTempSensor = ({ id, controllerId, value }: OneWireTempSensor) => {
  commitAddBlock(store, { id, controllerId, value, type: 'OneWireTempSensor' });
};
