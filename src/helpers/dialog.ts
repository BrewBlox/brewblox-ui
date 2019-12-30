import { Dialog, DialogChainObject, QDialogOptions } from 'quasar';

import { Block } from '@/plugins/spark/types';
import { WidgetMode } from '@/store/features';

export function createDialog(opts: QDialogOptions & { [prop: string]: any }): DialogChainObject {
  return Dialog.create(opts);
}

export function createBlockDialog(block: Block | null, opts: { props?: any; mode?: WidgetMode } = {}): void {
  if (!block) {
    return;
  }
  const { props, mode } = opts;
  createDialog({
    component: 'BlockWidgetDialog',
    serviceId: block.serviceId,
    blockId: block.id,
    mode,
    getProps: () => props || {},
  });
};
