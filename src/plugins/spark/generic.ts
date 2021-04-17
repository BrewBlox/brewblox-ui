import { sparkStore } from '@/plugins/spark/store';
import { BlockConfig } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';
import { Widget } from '@/store/widgets';

const removeBlock =
  (widget: Widget<BlockConfig>): void => {
    const { serviceId, blockId } = widget.config;
    const block = sparkStore.blockById(serviceId, blockId);
    if (block) {
      sparkStore.removeBlock(block);
    }
  };

export const genericBlockFeature: Pick<WidgetFeature, 'wizard' | 'widgetSize' | 'removeActions'> = {
  wizard: 'BlockWidgetWizard',
  widgetSize: {
    cols: 4,
    rows: 4,
  },
  removeActions: [
    {
      description: 'Remove block on controller',
      action: removeBlock,
    },
  ],
};
