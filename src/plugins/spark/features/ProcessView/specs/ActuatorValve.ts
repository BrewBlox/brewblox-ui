import sparkStore from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';

import { LEFT, RIGHT, defaultSpec } from '../getters';
import { ComponentSpec, StatePart, Transitions } from '../types';

const spec: ComponentSpec = {
  ...defaultSpec,
  cards: ['ActuatorPartCard'],
  transitions: (part: StatePart): Transitions =>
    ((part.state || {}).closed)
      ? {}
      : {
        [LEFT]: [{ outCoords: RIGHT }],
        [RIGHT]: [{ outCoords: LEFT }],
      },
  interactHandler: (part: StatePart) => {
    const serviceId = part.settings.actuatorServiceId;
    const link = part.settings.actuatorLink;
    if (!serviceId || !link || !link.id) {
      return;
    }
    const block: Block = sparkStore.blocks(serviceId)[link.id];
    if (block) {
      block.data.state = !!part.state.closed ? 1 : 0;
      sparkStore.saveBlock([serviceId, block]);
    }
  },
};

export default spec;
