import { Store } from 'vuex';

import { OneWireTempSensor, OneWireTempSensorUpdate } from './OneWireTempSensor';
import { addBlock } from '../mutations';
import { saveBlock } from '../actions';
import { Series, BlocksContext } from '../state';
import { State } from '../../state';

export const addOneWireTempSensor =
  (context: BlocksContext, { id, settings, state }: OneWireTempSensor, metrics: Series[]) => {
    addBlock(context, { id, settings, state, metrics, type: 'OneWireTempSensor' });
  };

export const persist = async (store: Store<State>, oneWireTempSensor: OneWireTempSensorUpdate) => {
  try {
    await saveBlock(store, oneWireTempSensor);
  } catch (e) {
    throw new Error(e);
  }
};
