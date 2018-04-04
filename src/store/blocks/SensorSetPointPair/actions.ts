import { Store } from 'vuex';

import { saveBlock } from '../actions';

import { addBlock } from '../mutations';
import { SensorSetPointPair, SensorSetPointPairUpdate } from './SensorSetPointPair';
import { State } from '../../state';

export const addSensorSetPointPair = ({ id, links }: SensorSetPointPair) => {
  addBlock({ id, links, type: 'SensorSetPointPair' });
};

export const persist =
  async (store: Store<State>, sensorSetPointPair: SensorSetPointPairUpdate) => {
    try {
      await saveBlock(store, sensorSetPointPair);
    } catch (e) {
      throw new Error(e);
    }
  };
