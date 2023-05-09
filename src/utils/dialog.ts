import { Dialog, DialogChainObject, QDialogOptions } from 'quasar';
import {
  AllowedComponentProps,
  Component,
  GlobalComponents,
  VNodeProps,
} from 'vue';

/**
 * One of the globally registered component names from src/auto-import.d.ts
 * This file is manually generated from files in component directories.
 *
 * The convention is to postfix all components that are usable as custom Quasar dialog
 * with 'Dialog'.
 *
 * If you added a new dialog component, you must run `yarn components`
 * for it to be added to this type.
 */
export type GlobalDialogName = keyof GlobalComponents & `${string}Dialog`;

/**
 * The type of the `props` object accepted by the component C
 */
export type ComponentProps<C extends Component> = C extends new (
  ...args: any
) => any
  ? Omit<
      InstanceType<C>['$props'],
      keyof VNodeProps | keyof AllowedComponentProps
    >
  : never;

type SharedDialogOpts = Pick<
  QDialogOptions,
  'noBackdropDismiss' | 'noEscDismiss' | 'noRouteDismiss' | 'style' | 'class'
>;

export type NamedDialogOpts<N extends GlobalDialogName> = {
  component: N;
  componentProps?: ComponentProps<GlobalComponents[N]>;
} & SharedDialogOpts;

export type ComponentDialogOpts<C extends Component> = {
  component: C;
  componentProps?: ComponentProps<C>;
} & SharedDialogOpts;

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
 * `opts.component` must be the name of a custom Quasar Dialog component.
 * Only custom dialog components are supported, as we want all dialogs
 * to implement the functionality provided by the UseDialog composable.
 *
 * - https://next.quasar.dev/quasar-plugins/dialog#invoking-custom-component
 *
 * @param opts
 * @returns
 */
export function createDialog<N extends GlobalDialogName>(
  opts: NamedDialogOpts<N>,
): DialogChainObject {
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
export function createDialogPromise<N extends GlobalDialogName>(
  opts: NamedDialogOpts<N>,
): Promise<any> {
  return new Promise<any>((resolve) => {
    createDialog(opts)
      .onOk((v: any[]) => resolve(v))
      .onDismiss(() => resolve(undefined));
  });
}

/**
 * Spawns provided component in a Quasar QDialog.
 *
 * `opts.component` must be a custom Quasar Dialog component.
 * Only custom dialog components are supported, as we want all dialogs
 * to implement the functionality provided by the UseDialog composable.
 *
 * - https://next.quasar.dev/quasar-plugins/dialog#invoking-custom-component
 *
 * @param opts
 * @returns
 */
export function createComponentDialog<C extends Component>(
  opts: ComponentDialogOpts<C>,
): DialogChainObject {
  return Dialog.create(opts);
}

/**
 * Spawns provided component in a Quasar Dialog, and wraps callbacks in a Promise.
 *
 * The arguments typically provided as argument to `createComponentDialog(opts).onOk(args)`
 * are now used to resolve the promise.
 *
 * @param opts
 * @returns
 */
export function createComponentDialogPromise<C extends Component>(
  opts: ComponentDialogOpts<C>,
): Promise<any> {
  return new Promise<any>((resolve) => {
    createComponentDialog(opts)
      .onOk((v: any[]) => resolve(v))
      .onDismiss(() => resolve(undefined));
  });
}
