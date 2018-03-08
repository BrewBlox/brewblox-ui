import store from '../../';

import { commitAddBlock } from '../mutations';
import { OneWireTempSensor } from './OneWireTempSensor';
import { persistBlock } from '../actions';

export const addOneWireTempSensor = ({ id, settings, state }: OneWireTempSensor) => {
  commitAddBlock(store, { id, settings, state, type: 'OneWireTempSensor', isLoading: false });
};

export const persist = (oneWireTempSensor: OneWireTempSensor) => {
  persistBlock(oneWireTempSensor);
};
