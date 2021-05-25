import { Dialog, DialogChainObject, QDialogOptions } from 'quasar';

import { sparkStore } from '@/plugins/spark/store';
import { BlockAddress } from '@/plugins/spark/types';
import { WidgetMode } from '@/store/features';

import notify from './notify';

interface BlockDialogOpts {
  props?: any;
  mode?: WidgetMode;
  verify?: boolean;
}

type DialogOpts = Pick<QDialogOptions, 'component' | 'componentProps'>

export function getNumDialogs(): number {
  return document.getElementsByClassName('q-dialog').length;
}

export function createDialog({ component, componentProps }: DialogOpts): DialogChainObject {
  return Dialog.create({
    component,
    componentProps,
  });
}

export function createDialogPromise(opts: DialogOpts): Promise<any> {
  return new Promise<any>(resolve => {
    createDialog(opts)
      .onOk((v: any[]) => resolve(v))
      .onDismiss(() => resolve(undefined));
  });
}

export function createBlockDialog(addr: BlockAddress | null, opts: BlockDialogOpts = {}): DialogChainObject | null {
  if (!addr || !addr.id) {
    return null;
  }
  if (opts.verify !== false && !sparkStore.blockById(addr.serviceId, addr.id)) {
    notify.warn(`Block not found: <i>${addr.id}</i>`);
    return null;
  }
  const { props, mode } = opts;
  return createDialog({
    component: 'BlockWidgetDialog',
    componentProps: {
      serviceId: addr.serviceId,
      blockId: addr.id,
      mode,
      getProps: () => props || {},
    },
  });
}

export async function createBlockDialogPromise(
  addr: BlockAddress | null,
  opts: BlockDialogOpts = {},
): Promise<void> {
  const chain = createBlockDialog(addr, opts);
  if (chain) {
    await new Promise(resolve => chain.onDismiss(resolve));
  }
}
