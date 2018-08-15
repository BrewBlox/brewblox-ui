import { OneWireTempSensor } from './OneWireTempSensor';
import { addBlock } from '../mutations';
import { saveBlock } from '../actions';
import { Series, BlocksContext, Block } from '../state';
import { RootStore } from '../../state';

export const addOneWireTempSensor = (
  context: BlocksContext,
  raw: Block,
  metrics: Series[],
) => {
  addBlock(
    context,
    {
      ...raw,
      settings: raw.data.settings,
      state: raw.data.state,
    },
  );
};

export const persist = async (store: RootStore, oneWireTempSensor: OneWireTempSensor) => {
  try {
    await saveBlock(store, oneWireTempSensor);
  } catch (e) {
    throw new Error(e);
  }
};
