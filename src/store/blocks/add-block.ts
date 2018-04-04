import { Block, Series, BlocksContext } from './state';

import { addSensorSetPointPair } from './SensorSetPointPair/actions';
import { addSetPoint } from './SetPointSimple/actions';
import { addOneWireTempSensor } from './OneWireTempSensor/actions';
import { addPID } from './PID/actions';

export default function addBlock(context: BlocksContext, block: Block, metrics: Series[] = []) {
  switch (block.type) {
    case 'SensorSetPointPair':
      addSensorSetPointPair(context, block);
      break;
    case 'OneWireTempSensor':
      addOneWireTempSensor(context, block, metrics);
      break;
    case 'SetPointSimple':
      addSetPoint(context, block);
      break;
    case 'PID':
      addPID(context, block);
      break;
    default:
      throw new Error('Invalid block type');
  }
}
