import { useSparkStore } from '@/plugins/spark/store';
import { Block, ComparedBlockType } from '@/plugins/spark/types';
import { useFeatureStore } from '@/store/features';
import { Widget, useWidgetStore } from '@/store/widgets';
import { createDialog } from '@/utils/dialog';
import { notify } from '@/utils/notify';

import { WizardDialogResult } from './types';

export async function tryCreateWidget<T>(
  widget: Widget<T>,
): Promise<Widget<T> | null> {
  try {
    const widgetStore = useWidgetStore();
    const featureStore = useFeatureStore();
    await widgetStore.appendWidget(widget);
    const featureTitle = featureStore.widgetTitle(widget.feature);
    notify.done(`Created ${featureTitle} widget <b>${widget.title}</b>`);
    return widgetStore.widgetById(widget.id);
  } catch (e: any) {
    notify.error(`Failed to create widget: ${e.toString()}`);
    return null;
  }
}

export async function tryCreateBlock(block: Block): Promise<Block | null> {
  try {
    const sparkStore = useSparkStore();
    const featureStore = useFeatureStore();
    await sparkStore.createBlock(block);
    const featureTitle = featureStore.widgetTitle(block.type);
    notify.done(`Created ${featureTitle} block <i>${block.id}</i>`);
    return sparkStore.blockByAddress(block);
  } catch (e: any) {
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
      initialWizard: useFeatureStore().widgetWizard(featureId),
      initialProps: {
        featureId,
      },
      // Prevent users from navigating to other wizards
      // This preserves initialProps
      showMenu: false,
    },
  });
}
