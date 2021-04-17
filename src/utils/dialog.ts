import { Dialog, DialogChainObject, QDialogOptions } from 'quasar';
import { App, Plugin } from 'vue';

import { sparkStore } from '@/plugins/spark/store';
import { BlockAddress } from '@/plugins/spark/types';
import { WidgetMode } from '@/store/features';

interface BlockDialogOpts {
  props?: any;
  mode?: WidgetMode;
  verify?: boolean;
}

// Workaround hack to fix https://github.com/quasarframework/quasar/issues/8885
// We save a reference to the current (and only) Vue app, so we can lookup components here
export const dialogFixPlugin: Plugin & { globalApp: App | null } = {
  install(app) {
    this.globalApp = app;
  },
  globalApp: null,
};

type DialogOpts = Pick<QDialogOptions, 'component' | 'componentProps'>

export function getNumDialogs(): number {
  return document.getElementsByClassName('q-dialog').length;
}

export function createDialog({ component, componentProps }: DialogOpts): DialogChainObject {
  return Dialog.create({
    component: dialogFixPlugin.globalApp!.component(component),
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
  if (opts.verify && !sparkStore.blockById(addr.serviceId, addr.id)) {
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
