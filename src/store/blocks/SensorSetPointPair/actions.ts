import { saveBlock } from '../actions';

import { addBlock } from '../mutations';
import { SensorSetPointPair, SensorSetPointPairUpdate } from './SensorSetPointPair';
import { RootStore } from '../../state';
import { BlocksContext } from '../state';

export const addSensorSetPointPair =
  (context: BlocksContext, { id, serviceId, links }: SensorSetPointPair) => {
    addBlock(
      context,
      {
        id,
        serviceId,
        links,
        type: 'SensorSetPointPair',
      },
    );
  };

export const persist =
  async (store: RootStore, sensorSetPointPair: SensorSetPointPairUpdate) => {
    try {
      await saveBlock(store, sensorSetPointPair);
    } catch (e) {
      throw new Error(e);
    }
  };
