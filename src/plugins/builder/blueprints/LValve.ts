import { DigitalState } from 'brewblox-proto/ts';
import {
  LEFT,
  RIGHT,
  UP,
  VALVE_CLOSED_KEY,
  VALVE_KEY,
  VALVE_TYPES,
  ValveBlockT,
} from '@/plugins/builder/const';
import {
  BuilderBlueprint,
  BuilderPart,
  PartTransitions,
} from '@/plugins/builder/types';
import { settingsBlock } from '@/plugins/builder/utils';

const blueprint: BuilderBlueprint = {
  type: 'LValve',
  title: 'Valve: L',
  component: 'LValvePartComponent',
  defaultSize: { width: 1, height: 1 },
  transitions: (part: BuilderPart): PartTransitions => {
    const block = settingsBlock<ValveBlockT>(part, VALVE_KEY, VALVE_TYPES);
    const closed =
      block != null
        ? Boolean(block.data.state === DigitalState.STATE_ACTIVE)
        : Boolean(part.settings[VALVE_CLOSED_KEY]);
    return closed
      ? {
          [UP]: [{ outCoords: LEFT }],
          [LEFT]: [{ outCoords: UP }],
        }
      : {
          [UP]: [{ outCoords: RIGHT }],
          [RIGHT]: [{ outCoords: UP }],
        };
  },
};

export default blueprint;
