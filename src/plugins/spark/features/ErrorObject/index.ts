import { Plugin } from 'vue';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import widget from './ErrorObjectWidget.vue';

/**
 * The Spark service emits placeholder blocks when it fails to decode a block:
 * - `ErrorObject` if decoding raised an error.
 *   Data: `{ error: string, blockType: string }`.
 * - `UnknownType` if it has no codec entry for the block type.
 *   Data: `{ error: string }`.
 *
 * Neither type is part of `BlockType`, and neither has a BlockSpec.
 * Both are rendered by the same widget.
 */
const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();
    const component = cref(app, widget);

    const features: Pick<WidgetFeature, 'id' | 'title'>[] = [
      { id: 'ErrorObject', title: 'Error Object' },
      { id: 'UnknownType', title: 'Unknown Block' },
    ];

    for (const { id, title } of features) {
      featureStore.addWidgetFeature({
        ...genericBlockFeature,
        id,
        title,
        role: 'Other',
        component,
        creatable: false,
        widgetSize: {
          cols: 4,
          rows: 3,
        },
      });
    }
  },
};

export default plugin;
