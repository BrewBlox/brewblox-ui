import { useSparkStore } from '@/plugins/spark/store';
import { BlockConfig } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';
import { Widget } from '@/store/widgets';

function removeBlock(widget: Widget<BlockConfig>): void {
  const sparkStore = useSparkStore();
  const { serviceId, blockId } = widget.config;
  const block = sparkStore.blockById(serviceId, blockId);
  if (block) {
    sparkStore.removeBlock(block);
  }
}

type BlockFeatureBase = Pick<WidgetFeature, 'wizard' | 'removeActions'>;

export const genericBlockFeature: BlockFeatureBase = {
  wizard: 'BlockWidgetWizard',
  removeActions: [
    {
      description: 'Remove block on controller',
      action: removeBlock,
    },
  ],
};

export const systemBlockFeature: BlockFeatureBase = {
  ...genericBlockFeature,
  removeActions: undefined,
  wizard: 'SystemBlockWidgetWizard',
};

export const discoveredBlockFeature: BlockFeatureBase = {
  ...genericBlockFeature,
  wizard: 'BlockDiscoveryWizard',
};
