import {
  LEFT,
  RIGHT,
  ValveBlockT,
  VALVE_CLOSED_KEY,
  VALVE_KEY,
  VALVE_TYPES,
} from '@/plugins/builder/const';
import {
  BuilderBlueprint,
  PersistentPart,
  Transitions,
} from '@/plugins/builder/types';
import { DigitalState } from 'brewblox-proto/ts';
import { settingsAddress, settingsBlock } from '../utils';

const blueprint: BuilderBlueprint = {
  type: 'Valve',
  title: 'Valve',
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
  size: () => [1, 1],
  transitions: (part: PersistentPart): Transitions => {
    const hasAddress = settingsAddress(part, VALVE_KEY).id !== null;
    const block = hasAddress
      ? settingsBlock<ValveBlockT>(part, VALVE_KEY, VALVE_TYPES)
      : null;
    const closed = hasAddress
      ? block?.data.state !== DigitalState.STATE_ACTIVE
      : Boolean(part.settings[VALVE_CLOSED_KEY]);

    return closed
      ? {}
      : {
          [LEFT]: [{ outCoords: RIGHT }],
          [RIGHT]: [{ outCoords: LEFT }],
        };
  },
};

export default blueprint;
