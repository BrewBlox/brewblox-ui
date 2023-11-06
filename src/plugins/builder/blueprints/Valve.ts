import { settingsAddress, settingsBlock } from '../utils';
import {
  LEFT,
  RIGHT,
  ValveBlockT,
  VALVE_CLOSED_KEY,
  VALVE_KEY,
  VALVE_TYPES,
} from '@/plugins/builder/const';
import { BuilderBlueprint, BuilderPart } from '@/plugins/builder/types';
import { DigitalState } from 'brewblox-proto/ts';

const blueprint: BuilderBlueprint = {
  type: 'Valve',
  title: 'Valve',
  component: 'ValvePartComponent',
  defaultSize: { width: 1, height: 1 },
  transitions: (part: BuilderPart) => {
    const hasAddress = settingsAddress(part, VALVE_KEY).id !== null;
    const block = hasAddress
      ? settingsBlock<ValveBlockT>(part, VALVE_KEY, VALVE_TYPES)
      : null;
    const closed = hasAddress
      ? block?.data.state !== DigitalState.STATE_ACTIVE
      : Boolean(part.settings[VALVE_CLOSED_KEY]);

    return closed
      ? null
      : {
          [LEFT]: [{ outCoords: RIGHT }],
          [RIGHT]: [{ outCoords: LEFT }],
        };
  },
};

export default blueprint;
