import { Block } from './state';

import { addSensorSetPointPair } from './SensorSetPointPair/actions';
import { addSetPoint } from './SetPointSimple/actions';
import { addOneWireTempSensor } from './OneWireTempSensor/actions';

export default function addBlock(block: Block) {
  switch (block.type) {
    case 'SensorSetPointPair':
      addSensorSetPointPair(block);
      break;
    case 'OneWireTempSensor':
      addOneWireTempSensor(block);
      break;
    case 'SetPointSimple':
      addSetPoint(block);
      break;
    default:
      throw new Error('Invalid block type');
  }
}
