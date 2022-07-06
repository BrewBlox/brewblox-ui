import { Dialog, DialogChainObject, QDialogOptions } from 'quasar';

type DialogOpts = Pick<QDialogOptions, 'component' | 'componentProps'>;

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
  return new Promise<any>((resolve) => {
    createDialog(opts)
      .onOk((v: any[]) => resolve(v))
      .onDismiss(() => resolve(undefined));
  });
}
