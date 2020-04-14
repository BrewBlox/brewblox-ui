import { blockTypes } from '@/plugins/spark/block-types';
import { sparkStore } from '@/plugins/spark/store';
import { DigitalState } from '@/plugins/spark/types';

import { CENTER, LEFT, RIGHT, UP } from '../getters';
import { settingsBlock } from '../helpers';
import { PartSpec, PartUpdater, PersistentPart, Transitions } from '../types';

const spec: PartSpec = {
  id: 'LValve',
  title: 'Valve: L',
  size: () => [1, 1],
  cards: [{
    component: 'BlockAddressCard',
    props: {
      settingsKey: 'valve',
      compatible: [blockTypes.MotorValve, blockTypes.DigitalActuator],
      label: 'Valve or Actuator',
    },
  }],
  transitions: (part: PersistentPart): Transitions => {
    const block = settingsBlock(part, 'valve');
    const closed = block !== null
      ? Boolean(block.data.state === DigitalState.Active)
      : Boolean(part.settings.closed);
    return closed
      ? {
        [UP]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
        [LEFT]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
        [CENTER]: [
          { outCoords: UP, friction: 0.5 },
          { outCoords: LEFT, friction: 0.5 },
        ],
      }
      : {
        [UP]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
        [RIGHT]: [{ outCoords: CENTER, internal: true, friction: 0.5 }],
        [CENTER]: [
          { outCoords: UP, friction: 0.5 },
          { outCoords: RIGHT, friction: 0.5 },
        ],
      };
  },
  interactHandler: (part: PersistentPart, updater: PartUpdater) => {
    const block = settingsBlock(part, 'valve');
    if (block) {
      block.data.desiredState = block.data.state === DigitalState.Active
        ? DigitalState.Inactive
        : DigitalState.Active;
      sparkStore.saveBlock(block);
    }
    else {
      part.settings.closed = !part.settings.closed;
      updater.updatePart(part);
    }
  },
};

export default spec;
