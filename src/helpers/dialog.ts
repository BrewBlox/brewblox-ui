import { Dialog, DialogChainObject, QDialogOptions } from 'quasar';

import { sparkStore } from '@/plugins/spark/store';
import { BlockAddress, ComparedBlockType } from '@/plugins/spark/types';
import { WidgetMode } from '@/store/features';

export function createDialog(opts: QDialogOptions): DialogChainObject {
  return Dialog.create(opts);
}

interface BlockDialogOpts {
  props?: any;
  mode?: WidgetMode;
  verify?: boolean;
}

export function createBlockDialog(addr: BlockAddress | null, opts: BlockDialogOpts = {}): void {
  if (!addr || !addr.id) {
    return;
  }
  if (opts.verify && !sparkStore.blockById(addr.serviceId, addr.id)) {
    return;
  }
  const { props, mode } = opts;
  createDialog({
    component: 'BlockWidgetDialog',
    serviceId: addr.serviceId,
    blockId: addr.id,
    mode,
    getProps: () => props || {},
  });
};

export function createBlockWizardDialog(
  serviceId: string | null,
  compatible: ComparedBlockType = null
): DialogChainObject {
  return createDialog({
    component: 'WizardDialog',
    initialWizard: 'BlockWizard',
    initialProps: {
      compatible,
      activeServiceId: serviceId,
    },
    // Prevent users from navigating to other wizards
    // This allows clients to assume that DialogChainObject.onOk()
    // will be called with a Block argument
    showMenu: false,
  });
}
