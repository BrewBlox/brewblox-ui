import { OneWireTempSensor, OneWireTempSensorUpdate } from './OneWireTempSensor';
import { addBlock } from '../mutations';
import { saveBlock } from '../actions';
import { Series, BlocksContext } from '../state';
import { RootStore } from '../../state';

export const addOneWireTempSensor = (
  context: BlocksContext,
  {
    id,
    serviceId,
    profiles,
    settings,
    state,
  }: OneWireTempSensor,
  metrics: Series[],
) => {
  addBlock(
    context,
    {
      id,
      serviceId,
      profiles,
      settings,
      metrics,
      state,
      type: 'OneWireTempSensor',
    },
  );
};

export const persist = async (store: RootStore, oneWireTempSensor: OneWireTempSensorUpdate) => {
  try {
    await saveBlock(store, oneWireTempSensor);
  } catch (e) {
    throw new Error(e);
  }
};
