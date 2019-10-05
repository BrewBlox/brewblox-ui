import { ref } from '@/helpers/component-ref';
import { sparkStore } from '@/plugins/spark/store';
import { BlockConfig } from '@/plugins/spark/types';
import { Crud, Feature } from '@/store/features';

import wizard from '../BlockWidgetWizard.vue';

const deleteBlock =
  (crud: Crud): void => {
    const { config }: { config: BlockConfig } = crud.widget;
    const block = sparkStore.blocks(config.serviceId)[config.blockId];
    if (block) {
      sparkStore.removeBlock([config.serviceId, block]);
    }
  };

const feature: Partial<Feature> = {
  wizardComponent: ref(wizard),
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
