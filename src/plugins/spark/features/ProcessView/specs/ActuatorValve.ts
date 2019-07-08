import { typeName } from '@/plugins/spark/features/MotorValve/getters';
import sparkStore from '@/plugins/spark/store';
import { DigitalState } from '@/plugins/spark/types';

import { LEFT, RIGHT, defaultSpec } from '../getters';
import { settingsBlock } from '../helpers';
import { ComponentSpec, StatePart, Transitions } from '../types';

const spec: ComponentSpec = {
  ...defaultSpec,
  cards: [{
    component: 'LinkedBlockCard',
    props: { settingsKey: 'valve', typeName },
  }],
  transitions: (part: StatePart): Transitions => {
    const block = settingsBlock(part, 'valve');
    return block && block.data.state === DigitalState.Active
      ? {
        [LEFT]: [{ outCoords: RIGHT }],
        [RIGHT]: [{ outCoords: LEFT }],
      }
      : {};
  },
  interactHandler: (part: StatePart) => {
    const block = settingsBlock(part, 'valve');
    if (block) {
      block.data.desiredState = block.data.state === DigitalState.Active
        ? DigitalState.Inactive
        : DigitalState.Active;
      sparkStore.saveBlock([block.serviceId, block]);
    }
  },
};

export default spec;
