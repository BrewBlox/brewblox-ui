import { Dialog, DialogChainObject, QDialogOptions } from 'quasar';

import { sparkStore } from '@/plugins/spark/store';
import { BlockAddress } from '@/plugins/spark/types';
import { WidgetMode } from '@/store/features';

import { notify } from './notify';

type DialogOpts = Pick<QDialogOptions, 'component' | 'componentProps'>

interface BlockDialogOpts {
  props?: any;
  mode?: WidgetMode;
  verify?: boolean;
}

/**
 * Checks how many Quasar QDialogs are currently present in the DOM.
 *
 * @returns The number of active dialog components
 */
export function getNumDialogs(): number {
  return document.getElementsByClassName('q-dialog').length;
}

/**
 * Spawns provided component in a Quasar QDialog.
 *
 * `component` must be implemented as a custom Quasar Dialog component.
 * Only custom dialog components are supported, as we want all dialogs
 * to implement the functionality provided by the UseDialog composable.
 *
 * - https://next.quasar.dev/quasar-plugins/dialog#invoking-custom-component
 *
 * @param opts
 * @returns
 */
export function createDialog(opts: DialogOpts): DialogChainObject {
  return Dialog.create(opts);
}

/**
 * Spawns provided component in a Quasar Dialog, and wraps callbacks in a Promise.
 *
 * The arguments typically provided as argument to `createDialog(opts).onOk(args)`
 * are now used to resolve the promise.
 *
 * @param opts
 * @returns
 */
export function createDialogPromise(opts: DialogOpts): Promise<any> {
  return new Promise<any>(resolve => {
    createDialog(opts)
      .onOk((v: any[]) => resolve(v))
      .onDismiss(() => resolve(undefined));
  });
}

/**
 * Spawns a Quasar Dialog to render the block widget for the given address.
 * A volatile widget will be generated for the duration of the dialog.
 *
 * If the address is null or invalid, this function immediately returns null.
 *
 * @param addr
 * @param opts
 * @returns
 */
export function createBlockDialog(
  addr: BlockAddress | null,
  opts: BlockDialogOpts = {},
): DialogChainObject | null {
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

/**
 * Spawns a Quasar Dialog to render the block widget for the given address.
 * A volatile widget will be generated for the duration of the dialog.
 *
 * If `addr` is null or invalid, the function immediately returns `false`,
 * otherwise it returns `true` after the dialog is dismissed.
 *
 * @param addr
 * @param opts
 * @returns false if the dialog was never shown, otherwise true after the dialog closed.
 */
export async function createBlockDialogPromise(
  addr: BlockAddress | null,
  opts: BlockDialogOpts = {},
): Promise<boolean> {
  const chain = createBlockDialog(addr, opts);
  return chain
    ? new Promise<boolean>(resolve => chain.onDismiss(() => resolve(true)))
    : false;
}
