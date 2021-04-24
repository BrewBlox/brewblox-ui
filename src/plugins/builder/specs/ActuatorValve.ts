import { LEFT, RIGHT } from '@/plugins/builder/const';
import { PartSpec, PersistentPart, Transitions } from '@/plugins/builder/types';
import { settingsBlock } from '@/plugins/builder/utils';
import { sparkStore } from '@/plugins/spark/store';
import {
  BlockType,
  ComparedBlockType,
  DigitalActuatorBlock,
  DigitalState,
  MotorValveBlock,
} from '@/plugins/spark/types';

export type ValveT = DigitalActuatorBlock | MotorValveBlock;

export const VALVE_KEY = 'valve';
export const VALVE_TYPES: ComparedBlockType = [BlockType.DigitalActuator, BlockType.MotorValve];

const spec: PartSpec = {
  id: 'ActuatorValve',
  title: 'Valve: actuator',
  size: () => [1, 1],
  cards: [{
    component: 'BlockAddressCard',
    props: {
      settingsKey: VALVE_KEY,
      compatible: [BlockType.MotorValve, BlockType.DigitalActuator],
      label: 'Valve or Actuator',
    },
  }],
  transitions: (part: PersistentPart): Transitions => {
    const block = settingsBlock<ValveT>(part, VALVE_KEY, VALVE_TYPES);
    return block?.data.state === DigitalState.STATE_ACTIVE
      ? {
        [LEFT]: [{ outCoords: RIGHT }],
        [RIGHT]: [{ outCoords: LEFT }],
      }
      : {};
  },
  interactHandler: (part: PersistentPart) => {
    const block = settingsBlock<ValveT>(part, VALVE_KEY, VALVE_TYPES);
    if (block) {
      block.data.desiredState =
        block.data.state === DigitalState.STATE_ACTIVE
          ? DigitalState.STATE_INACTIVE
          : DigitalState.STATE_ACTIVE;
      sparkStore.saveBlock(block);
    }
  },
};

export default spec;
