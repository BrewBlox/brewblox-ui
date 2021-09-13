import { LEFT, RIGHT, UP } from '@/plugins/builder/const';
import { PartSpec, PersistentPart, Transitions } from '@/plugins/builder/types';
import { settingsBlock } from '@/plugins/builder/utils';
import { sparkStore } from '@/plugins/spark/store';
import {
  BlockType,
  DigitalActuatorBlock,
  DigitalState,
  MotorValveBlock,
} from '@/plugins/spark/types';

export type ValveT = DigitalActuatorBlock | MotorValveBlock;

export const VALVE_KEY = 'valve';
export const VALVE_TYPES = [BlockType.MotorValve, BlockType.DigitalActuator];

const spec: PartSpec = {
  id: 'LValve',
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
  interactHandler: (part: PersistentPart, { savePart }) => {
    const block = settingsBlock<ValveT>(part, VALVE_KEY, VALVE_TYPES);
    if (block) {
      block.data.desiredState =
        block.data.state === DigitalState.STATE_ACTIVE
          ? DigitalState.STATE_INACTIVE
          : DigitalState.STATE_ACTIVE;
      sparkStore.saveBlock(block);
    } else {
      part.settings.closed = !part.settings.closed;
      savePart(part);
    }
  },
};

export default spec;
