import { ComponentSettings, Transitions, StatePart, PartUpdater } from '../state';
import { LEFT, RIGHT } from '../getters';
import { defaultSettings } from '../components/getters';
import { blocks } from '@/plugins/spark/store/getters';
import { Block } from '@/plugins/spark/state';
import { saveBlock } from '@/plugins/spark/store/actions';

const settings: ComponentSettings = {
  ...defaultSettings,
  cards: ['ActuatorPartCard'],
  transitions: (part: StatePart): Transitions =>
    ((part.state || {}).closed)
      ? {}
      : {
        [LEFT]: [{ outCoords: RIGHT }],
        [RIGHT]: [{ outCoords: LEFT }],
      },
  interactHandler: (part: StatePart, updater: PartUpdater) => {
    const serviceId = part.settings.actuatorServiceId;
    const link = part.settings.actuatorLink;
    if (!serviceId || !link || !link.id) {
      return;
    }
    const block: Block = blocks(updater.store, serviceId)[link.id];
    if (block) {
      block.data.state = !!part.state.closed ? 1 : 0;
      saveBlock(updater.store, serviceId, block);
    }
  },
};

export default settings;
