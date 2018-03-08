import { persistBlock } from '../actions';

import { addBlock } from '../mutations';
import { SensorSetPointPair, SensorSetPointPairUpdate } from './SensorSetPointPair';

export const addSensorSetPointPair = ({ id, links }: SensorSetPointPair) => {
  addBlock({ id, links, type: 'SensorSetPointPair' });
};

export const persist = (sensorSetPointPair: SensorSetPointPairUpdate) => {
  persistBlock(sensorSetPointPair);
};
