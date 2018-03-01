import store from '../../';

import { commitAddBlock } from '../mutations';
import { OneWireTempSensor } from './OneWireTempSensor';

export const addOneWireTempSensor = ({ id, settings, state }: OneWireTempSensor) => {
  commitAddBlock(store, { id, settings, state, type: 'OneWireTempSensor', isLoading: false });
};
