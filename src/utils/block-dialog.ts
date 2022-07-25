import { useSparkStore } from '@/plugins/spark/store';
import { BlockAddress } from '@/plugins/spark/types';
import { WidgetMode } from '@/store/features';
import { DialogChainObject } from 'quasar';
import { createDialog } from './dialog';
import { notify } from './notify';

interface BlockDialogOpts {
  props?: any;
  mode?: WidgetMode;
  verify?: boolean;
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
  if (
    opts.verify !== false &&
    useSparkStore().blockById(addr.serviceId, addr.id) == null
  ) {
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
    ? new Promise<boolean>((resolve) => chain.onDismiss(() => resolve(true)))
    : false;
}
