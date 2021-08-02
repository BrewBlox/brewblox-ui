import { sparkStore } from '@/plugins/spark/store';
import { Block, ComparedBlockType } from '@/plugins/spark/types';
import { featureStore } from '@/store/features';
import { Widget, widgetStore } from '@/store/widgets';
import { createDialog } from '@/utils/dialog';
import { notify } from '@/utils/notify';

import { WizardDialogResult } from './types';


export async function tryCreateWidget<T>(widget: Widget<T>): Promise<Widget<T> | null> {
  try {
    await widgetStore.appendWidget(widget);
    notify.done(`Created ${featureStore.widgetTitle(widget.feature)} widget <b>${widget.title}</b>`);
    return widgetStore.widgetById(widget.id);
  }
  catch (e) {
    notify.error(`Failed to create widget: ${e.toString()}`);
    return null;
  }
}

export async function tryCreateBlock(block: Block): Promise<Block | null> {
  try {
    await sparkStore.createBlock(block);
    notify.done(`Created ${featureStore.widgetTitle(block.type)} block <i>${block.id}</i>`);
    return sparkStore.blockByAddress(block);
  }
  catch (e) {
    notify.error(`Failed to create block: ${e.toString()}`);
    return null;
  }
}

export function createBlockWizard(
  serviceId: string | null,
  compatible: ComparedBlockType = null,
): WizardDialogResult {
  return createDialog({
    component: 'WizardDialog',
    componentProps: {
      initialWizard: 'BlockWizard',
      initialProps: {
        compatible,
        activeServiceId: serviceId,
      },
      // Prevent users from navigating to other wizards
      // This preserves initialProps
      showMenu: false,
    },
  });
}

export function createWidgetWizard(featureId: string): WizardDialogResult {
  return createDialog({
    component: 'WizardDialog',
    componentProps: {
      initialWizard: featureStore.widgetWizard(featureId),
      initialProps: {
        featureId,
      },
      // Prevent users from navigating to other wizards
      // This preserves initialProps
      showMenu: false,
    },
  });
}
