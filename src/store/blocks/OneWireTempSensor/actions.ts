import { addBlock } from '../mutations';
import { OneWireTempSensor, OneWireTempSensorUpdate } from './OneWireTempSensor';
import { persistBlock } from '../actions';

export const addOneWireTempSensor = ({ id, settings, state }: OneWireTempSensor) => {
  addBlock({ id, settings, state, type: 'OneWireTempSensor', isLoading: false });
};

export const persist = (oneWireTempSensor: OneWireTempSensorUpdate) => {
  persistBlock(oneWireTempSensor);
};
