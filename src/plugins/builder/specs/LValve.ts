import { LEFT, RIGHT, UP } from '@/plugins/builder/const';
import { PartSpec, PartUpdater, PersistentPart, Transitions } from '@/plugins/builder/types';
import { settingsBlock } from '@/plugins/builder/utils';
import { sparkStore } from '@/plugins/spark/store';
import { BlockType, DigitalActuatorBlock, DigitalState, MotorValveBlock } from '@/plugins/spark/types';

type BlockT = DigitalActuatorBlock | MotorValveBlock;
const addressKey = 'valve';

const spec: PartSpec = {
  id: 'LValve',
  title: 'Valve: L',
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
    const closed = block !== null
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
  interactHandler: (part: PersistentPart, updater: PartUpdater) => {
    const block = settingsBlock<BlockT>(part, addressKey);
    if (block) {
      block.data.desiredState =
        block.data.state === DigitalState.STATE_ACTIVE
          ? DigitalState.STATE_INACTIVE
          : DigitalState.STATE_ACTIVE;
      sparkStore.saveBlock(block);
    }
    else {
      part.settings.closed = !part.settings.closed;
      updater.updatePart(part);
    }
  },
};

export default spec;
