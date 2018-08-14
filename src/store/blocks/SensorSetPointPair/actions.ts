import { saveBlock, createBlock } from '../actions';

import { addBlock } from '../mutations';
import { SensorSetPointPair, SensorSetPointPairUpdate, SensorSetPointPairCreateNew }
  from './SensorSetPointPair';
import { RootStore } from '../../state';
import { BlocksContext } from '../state';

export const createSensorSetPointPair =
  (store: RootStore, block: SensorSetPointPairCreateNew) =>
    createBlock(store, {
      type: 'SensorSetPointPair',
      ...block,
    });

export const addSensorSetPointPair =
  (
    context: BlocksContext,
    {
      id,
      serviceId,
      profiles,
      sensor,
      setpoint,
    }: SensorSetPointPair,
  ) => addBlock(
    context,
    {
      id,
      serviceId,
      profiles,
      sensor,
      setpoint,
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
