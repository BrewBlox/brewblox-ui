import { ref } from '@/helpers/component-ref';
import { sparkStore } from '@/plugins/spark/store';
import { BlockConfig } from '@/plugins/spark/types';
import { Feature, featureStore,WidgetSelector } from '@/store/features';

import wizard from '../BlockWidgetWizard.vue';
import widget from './GenericBlock.vue';

// Selects the correct feature for the actual block
const selector: WidgetSelector =
  (config: BlockConfig): string | undefined => {
    if (!sparkStore.serviceAvailable(config.serviceId)) {
      throw new Error(`Service '${config.serviceId}' not found`);
    }
    const block = sparkStore.blocks(config.serviceId)[config.blockId];
    return block
      ? featureStore.widgetById(block.type, config, false)
      : 'UnknownBlockWidget';
  };

// validates feature config
const validator =
  (config: BlockConfig): boolean => {
    if (!sparkStore.serviceAvailable(config.serviceId)) {
      throw new Error(`Service '${config.serviceId}' not found`);
    }
    if (config.blockId === null || config.blockId === undefined) {
      throw new Error('Block ID is undefined');
    }
    return true;
  };

const deleteBlock =
  (config: BlockConfig): void => {
    const block = sparkStore.blocks(config.serviceId)[config.blockId];
    if (block) {
      sparkStore.removeBlock([config.serviceId, block]);
    }
  };

const feature: Partial<Feature> = {
  selector,
  validator,
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
