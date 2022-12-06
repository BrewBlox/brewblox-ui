import {
  LEFT,
  RIGHT,
  UP,
  ValveBlockT,
  VALVE_KEY,
  VALVE_TYPES,
} from '@/plugins/builder/const';
import {
  BuilderBlueprint,
  PersistentPart,
  Transitions,
} from '@/plugins/builder/types';
import { settingsBlock } from '@/plugins/builder/utils';
import { DigitalState } from 'brewblox-proto/ts';

const blueprint: BuilderBlueprint = {
  type: 'LValve',
  title: 'Valve: L',
  size: () => [1, 1],
  cards: [
    {
      component: 'BlockAddressCard',
      props: {
        settingsKey: VALVE_KEY,
        compatible: VALVE_TYPES,
        label: 'Valve or Actuator',
      },
    },
  ],
  transitions: (part: PersistentPart): Transitions => {
    const block = settingsBlock<ValveBlockT>(part, VALVE_KEY, VALVE_TYPES);
    const closed =
      block !== null
        ? Boolean(block.data.state === DigitalState.STATE_ACTIVE)
        : Boolean(part.settings.closed);
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
