import { sparkStore } from '@/plugins/spark/store';
import { BlockConfig } from '@/plugins/spark/types';
import { Crud, WidgetFeature } from '@/store/features';

const deleteBlock =
  (crud: Crud): void => {
    const { config }: { config: BlockConfig } = crud.widget;
    const block = sparkStore.blocks(config.serviceId)[config.blockId];
    if (block) {
      sparkStore.removeBlock([config.serviceId, block]);
    }
  };

export const genericBlockFeature: Partial<WidgetFeature> = {
  wizardComponent: 'BlockWidgetWizard',
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
