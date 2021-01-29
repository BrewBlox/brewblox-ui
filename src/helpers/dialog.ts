import { Dialog, DialogChainObject, QDialogOptions } from 'quasar';
import Vue from 'vue';

import { sparkStore } from '@/plugins/spark/store';
import { BlockAddress } from '@/plugins/spark/types';
import { WidgetMode } from '@/store/features';

export function getNumDialogs(): number {
  return document.getElementsByClassName('q-dialog').length;
}

export function createDialog(opts: { component: any } & QDialogOptions): DialogChainObject {
  return Dialog.create({
    ...opts,
    parent: Vue.$app, // This enables use of $router inside dialog components
  });
}

interface BlockDialogOpts {
  props?: any;
  mode?: WidgetMode;
  verify?: boolean;
}

export function createBlockDialog(addr: BlockAddress | null, opts: BlockDialogOpts = {}): DialogChainObject | null {
  if (!addr || !addr.id) {
    return null;
  }
  if (opts.verify && !sparkStore.blockById(addr.serviceId, addr.id)) {
    return null;
  }
  const { props, mode } = opts;
  return createDialog({
    component: 'BlockWidgetDialog',
    serviceId: addr.serviceId,
    blockId: addr.id,
    mode,
    getProps: () => props || {},
  });
};

export async function createBlockDialogPromise(addr: BlockAddress | null, opts: BlockDialogOpts = {}): Promise<void> {
  const chain = createBlockDialog(addr, opts);
  if (chain) {
    await new Promise(resolve => chain.onDismiss(resolve));
  }
}
