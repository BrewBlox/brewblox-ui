import { saveBlock, createBlock } from '../actions';

import { addBlock } from '../mutations';
import { SensorSetPointPair, SensorSetPointPairUpdate, SensorSetPointPairCreate }
  from './SensorSetPointPair';
import { RootStore } from '../../state';
import { BlocksContext } from '../state';

export const createSensorSetPointPair =
  (context: BlocksContext, block: SensorSetPointPairCreate) =>
    createBlock(context, {
      type: 'SensorSetPointPair',
      ...block,
    });

export const addSensorSetPointPair =
  (context: BlocksContext, { id, serviceId, links }: SensorSetPointPair) => addBlock(
    context,
    {
      id,
      serviceId,
      links,
      type: 'SensorSetPointPair',
    },
  );

export const persist =
  async (store: RootStore, sensorSetPointPair: SensorSetPointPairUpdate) => {
    try {
      await saveBlock(store, sensorSetPointPair);
    } catch (e) {
      throw new Error(e);
    }
  };
