import { sparkStore } from '@/plugins/spark/store';
import { BlockType, DigitalActuatorBlock, DigitalState, MotorValveBlock } from '@/plugins/spark/types';

import { LEFT, RIGHT } from '../getters';
import { settingsBlock } from '../helpers';
import { PartSpec, PersistentPart, Transitions } from '../types';

type BlockT = DigitalActuatorBlock | MotorValveBlock;
const addressKey = 'valve';

const spec: PartSpec = {
  id: 'ActuatorValve',
  title: 'Valve: actuator',
  size: () => [1, 1],
  cards: [{
    component: 'BlockAddressCard',
    props: {
      settingsKey: addressKey,
      compatible: [BlockType.MotorValve, BlockType.DigitalActuator],
      label: 'Valve or Actuator',
    },
  }],
  transitions: (part: PersistentPart): Transitions => {
    const block = settingsBlock<BlockT>(part, addressKey);
    return block?.data.state === DigitalState.STATE_ACTIVE
      ? {
        [LEFT]: [{ outCoords: RIGHT }],
        [RIGHT]: [{ outCoords: LEFT }],
      }
      : {};
  },
  interactHandler: (part: PersistentPart) => {
    const block = settingsBlock<BlockT>(part, addressKey);
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
