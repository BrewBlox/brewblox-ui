import { ref } from '@/helpers/component-ref';
import { serviceAvailable } from '@/helpers/dynamic-store';
import { BlockConfig } from '@/plugins/spark/state';
import { removeBlock } from '@/plugins/spark/store/actions';
import { blocks } from '@/plugins/spark/store/getters';
import { featureById } from '@/store/features/getters';
import { Feature, WidgetSelector } from '@/store/features/state';
import { RootStore } from '@/store/state';
import wizard from '../BlockWizard.vue';
import widget from './GenericBlock.vue';

const validator = (store: RootStore, config: BlockConfig) =>
  serviceAvailable(store, config.serviceId) &&
  config.blockId !== undefined;

// Selects the correct feature for the actual block
const selector: WidgetSelector = (store: RootStore, config: BlockConfig) => {
  const block = blocks(store, config.serviceId)[config.blockId];
  return block
    ? featureById(store, block.type).widget || 'InvalidWidget'
    : 'UnknownBlockWidget';
};

const deleteBlock = (store: RootStore, config: BlockConfig) => {
  const block = blocks(store, config.serviceId)[config.blockId];
  if (block) {
    removeBlock(store, config.serviceId, block);
  }
};

const feature: Partial<Feature> = {
  validator,
  selector,
  widget: ref(widget),
  wizard: ref(wizard),
  widgetSize: {
    cols: 4,
    rows: 4,
  },
  deleters: [
    {
      description: 'Delete block on controller',
      action: deleteBlock,
    },
  ],
};

export default feature;
