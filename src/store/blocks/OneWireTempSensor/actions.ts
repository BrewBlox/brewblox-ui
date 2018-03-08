import { addBlock } from '../mutations';
import { OneWireTempSensor, OneWireTempSensorUpdate } from './OneWireTempSensor';
import { persistBlock } from '../actions';

export const addOneWireTempSensor = ({ id, settings, state }: OneWireTempSensor) => {
  addBlock({ id, settings, state, type: 'OneWireTempSensor' });
};

export const persist = async (oneWireTempSensor: OneWireTempSensorUpdate) => {
  try {
    await persistBlock(oneWireTempSensor);
  } catch (e) {
    throw new Error(e);
  }
};
