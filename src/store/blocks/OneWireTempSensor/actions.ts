import { OneWireTempSensor, OneWireTempSensorUpdate } from './OneWireTempSensor';
import { addBlock } from '../mutations';
import { saveBlock } from '../actions';
import { Series } from '../state';

export const addOneWireTempSensor =
  ({ id, settings, state }: OneWireTempSensor, metrics: Series[]) => {
    addBlock({ id, settings, state, metrics, type: 'OneWireTempSensor' });
  };

export const persist = async (oneWireTempSensor: OneWireTempSensorUpdate) => {
  try {
    await saveBlock(oneWireTempSensor);
  } catch (e) {
    throw new Error(e);
  }
};
