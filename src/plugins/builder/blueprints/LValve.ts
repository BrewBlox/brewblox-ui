import { LEFT, RIGHT, UP } from '@/plugins/builder/const';
import {
  BuilderBlueprint,
  PersistentPart,
  Transitions,
} from '@/plugins/builder/types';
import { settingsBlock } from '@/plugins/builder/utils';
import {
  BlockType,
  DigitalActuatorBlock,
  DigitalState,
  MotorValveBlock,
} from 'brewblox-proto/ts';

export type ValveT = DigitalActuatorBlock | MotorValveBlock;

export const VALVE_KEY = 'valve';
export const VALVE_TYPES = [BlockType.MotorValve, BlockType.DigitalActuator];

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
    const block = settingsBlock<ValveT>(part, VALVE_KEY, VALVE_TYPES);
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
