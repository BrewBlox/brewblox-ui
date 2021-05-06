import { LEFT, RIGHT } from '@/plugins/builder/const';
import { PartSpec, PartUpdater, PersistentPart, Transitions } from '@/plugins/builder/types';
import { sparkStore } from '@/plugins/spark/store';
import { ComparedBlockType } from '@/plugins/spark/types';
import { BlockType, DigitalActuatorBlock, DigitalState, MotorValveBlock } from '@/shared-types';

import { settingsAddress, settingsBlock } from '../utils';

export type ValveT = DigitalActuatorBlock | MotorValveBlock;

export const CLOSED_KEY = 'closed';
export const VALVE_KEY = 'valve';
export const VALVE_TYPES: ComparedBlockType = [BlockType.DigitalActuator, BlockType.MotorValve];

const spec: PartSpec = {
  id: 'Valve',
  title: 'Valve',
  cards: [{
    component: 'BlockAddressCard',
    props: {
      settingsKey: VALVE_KEY,
      compatible: VALVE_TYPES,
      label: 'Valve or Actuator',
    },
  }],
  size: () => [1, 1],
  transitions: (part: PersistentPart): Transitions => {
    const hasAddress = settingsAddress(part, VALVE_KEY).id !== null;
    const block = hasAddress
      ? settingsBlock<ValveT>(part, VALVE_KEY, VALVE_TYPES)
      : null;
    const closed = hasAddress
      ? block?.data.state !== DigitalState.STATE_ACTIVE
      : Boolean(part.settings[CLOSED_KEY]);

    return closed
      ? {}
      : {
        [LEFT]: [{ outCoords: RIGHT }],
        [RIGHT]: [{ outCoords: LEFT }],
      };
  },
  interactHandler: (part: PersistentPart, updater: PartUpdater) => {
    const hasAddress = settingsAddress(part, VALVE_KEY).id !== null;
    if (hasAddress) {
      const block = settingsBlock<ValveT>(part, VALVE_KEY, VALVE_TYPES);
      if (block) {
        block.data.desiredState =
          block.data.state === DigitalState.STATE_ACTIVE
            ? DigitalState.STATE_INACTIVE
            : DigitalState.STATE_ACTIVE;
        sparkStore.saveBlock(block);
      }
    }
    else {
      part.settings[CLOSED_KEY] = !part.settings[CLOSED_KEY];
      updater.updatePart(part);
    }
  },
};

export default spec;
