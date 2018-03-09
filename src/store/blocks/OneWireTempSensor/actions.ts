import { addBlock } from '../mutations';
import { OneWireTempSensor, OneWireTempSensorUpdate } from './OneWireTempSensor';
import { saveBlock } from '../actions';

export const addOneWireTempSensor = ({ id, settings, state }: OneWireTempSensor) => {
  addBlock({ id, settings, state, metrics: [], type: 'OneWireTempSensor' });
};

export const persist = async (oneWireTempSensor: OneWireTempSensorUpdate) => {
  try {
    await saveBlock(oneWireTempSensor);
  } catch (e) {
    throw new Error(e);
  }
};
