import { App, Component } from 'vue';

import { useSparkStore } from '@/plugins/spark/store';
import { BlockType } from '@/shared-types';
import { ComponentResult, WidgetFeature } from '@/store/features';
import { Widget } from '@/store/widgets';
import { cref } from '@/utils/component-ref';

const errorComponent = (error: string): ComponentResult => ({
  component: 'InvalidWidget',
  error,
});

export function blockWidgetSelector(
  app: App,
  ctor: Component,
  typeName: BlockType | null,
): WidgetFeature['component'] {
  const component = cref(app, ctor);
  return (widget: Widget): ComponentResult => {
    const sparkStore = useSparkStore();
    const { config } = widget;
    if (!sparkStore.has(config.serviceId)) {
      return errorComponent(`Spark service '${config.serviceId}' not found`);
    }
    const block = sparkStore.blockById(config.serviceId, config.blockId);
    if (block === null) {
      return errorComponent(`Block '${config.blockId}' not found`);
    }
    if (typeName !== null && block.type !== typeName) {
      return errorComponent(
        `Block type '${block.type}' does not match widget type '${typeName}'`,
      );
    }
    return { component };
  };
}
