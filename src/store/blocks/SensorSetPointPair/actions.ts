import { Store } from 'vuex';

import { saveBlock } from '../actions';

import { addBlock } from '../mutations';
import { SensorSetPointPair, SensorSetPointPairUpdate } from './SensorSetPointPair';
import { State } from '../../state';
import { BlocksContext } from '../state';

export const addSensorSetPointPair =
  (context: BlocksContext, { id, links }: SensorSetPointPair) => {
    addBlock(context, { id, links, type: 'SensorSetPointPair' });
  };

export const persist =
  async (store: Store<State>, sensorSetPointPair: SensorSetPointPairUpdate) => {
    try {
      await saveBlock(store, sensorSetPointPair);
    } catch (e) {
      throw new Error(e);
    }
  };
