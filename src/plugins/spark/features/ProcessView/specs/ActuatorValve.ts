import { typeName } from '@/plugins/spark/features/DigitalActuator/getters';
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
  transitions: (part: StatePart): Transitions =>
    ((part.state || {}).closed)
      ? {}
      : {
        [LEFT]: [{ outCoords: RIGHT }],
        [RIGHT]: [{ outCoords: LEFT }],
      },
  interactHandler: (part: StatePart) => {
    const block = settingsBlock(part, 'valve');
    if (block) {
      block.data.desiredState = !!part.state.closed
        ? DigitalState.Active
        : DigitalState.Inactive;
      sparkStore.saveBlock([block.serviceId, block]);
    }
  },
};

export default spec;
