import { App, Component } from 'vue';

import { sparkStore } from '@/plugins/spark/store';
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
    const { config } = widget;
    const module = sparkStore.moduleById(config.serviceId);
    if (module === null) {
      return errorComponent(`Spark service '${config.serviceId}' not found`);
    }
    const block = module.blockById(config.blockId);
    if (block === null) {
      return errorComponent(`Block '${config.blockId}' not found`);
    }
    if (typeName !== null && block.type !== typeName) {
      return errorComponent(`Block type '${block.type}' does not match widget type '${typeName}'`);
    }
    return { component };
  };
}
