import { asBlockAddress, makeBlockIdRules } from './configuration';
import {
  isBlockCompatible,
  isBlockDisplayed,
  isBlockDisplayReady,
  isCompatible,
} from './info';
import { getDisplaySettingsBlock } from './system';
import { typeName as graphType } from '@/plugins/history/Graph/const';
import { addBlockGraph } from '@/plugins/history/Graph/utils';
import { useSparkStore } from '@/plugins/spark/store';
import { BlockAddress, DisplayOpts } from '@/plugins/spark/types';
import { useDashboardStore } from '@/store/dashboards';
import { useWidgetStore, Widget } from '@/store/widgets';
import { createBlockDialog } from '@/utils/block-dialog';
import { createDialog } from '@/utils/dialog';
import { bloxLink } from '@/utils/link';
import { notify } from '@/utils/notify';
import {
  Block,
  BlockIntfType,
  BlockType,
  DisplaySlot,
} from 'brewblox-proto/ts';
import isMatch from 'lodash/isMatch';
import range from 'lodash/range';

export async function discoverBlocks(
  serviceId: string | null,
  show = true,
): Promise<string[]> {
  const sparkStore = useSparkStore();
  if (!sparkStore.has(serviceId)) {
    return [];
  }
  const discovered = await sparkStore.fetchDiscoveredBlocks(serviceId);
  if (show) {
    notify.info({
      icon: 'mdi-magnify-plus-outline',
      message:
        discovered.length > 0
          ? `Discovered <i>${discovered.join(', ')}</i>.`
          : 'Discovered no new blocks.',
    });
  }
  return discovered;
}

export function startChangeBlockId(block: Maybe<Block>): void {
  if (!block) {
    return;
  }
  createDialog({
    component: 'InputDialog',
    componentProps: {
      modelValue: block.id,
      title: 'Change block name',
      message: `Choose a new name for <i>${block.id}</i>.`,
      html: true,
      clearable: false,
      rules: makeBlockIdRules(block.serviceId),
    },
  }).onOk((newId: string) => {
    const sparkStore = useSparkStore();
    sparkStore.renameBlock(block.serviceId, block.id, newId).catch(() => {});
  });
}

export function startRemoveBlock(block: Maybe<Block>): void {
  if (!block) {
    return;
  }
  const sparkStore = useSparkStore();
  const widgetStore = useWidgetStore();

  const widgets = widgetStore.widgets.filter(
    (v) =>
      v.feature === block.type &&
      isMatch(v.config, { serviceId: block.serviceId, blockId: block.id }),
  );

  // Has dedicated dashboard widgets
  if (widgets.length) {
    const selectOptions = [
      {
        label: 'Also remove widgets from dashboards',
        value: 0,
      },
    ];
    createDialog({
      component: 'CheckboxDialog',
      componentProps: {
        title: 'Remove widget',
        message: `Are you sure you want to remove <i>${block.id}</i>?`,
        html: true,
        modelValue: [0], // pre-check the default action
        selectOptions,
      },
    }).onOk((selected: number[]) => {
      sparkStore.removeBlock(block);
      if (selected.includes(0)) {
        widgets.forEach(widgetStore.removeWidget);
      }
    });
  }
  // No dashboard widgets found
  else {
    createDialog({
      component: 'ConfirmDialog',
      componentProps: {
        title: 'Remove block',
        message: `Are you sure you want to remove <i>${block.id}</i>?`,
        html: true,
      },
    }).onOk(() => {
      sparkStore.removeBlock(block);
    });
  }
}

export async function startAddBlockToGraphWidget(
  block: Block | null,
): Promise<void> {
  if (!block) {
    return;
  }

  const widgetStore = useWidgetStore();
  const dashboardStore = useDashboardStore();

  const graphOpts = widgetStore.widgets
    .filter((v) => v.feature === graphType)
    .map((v) => ({
      label: `[${dashboardStore.dashboardTitle(v.dashboard)}] ${v.title}`,
      value: v.id,
    }));

  const widgetId: string | null = await new Promise((resolve) => {
    if (graphOpts.length) {
      createDialog({
        component: 'SelectDialog',
        componentProps: {
          title: 'Select Graph widget',
          listSelect: graphOpts.length < 10,
          selectProps: {
            label: 'Graph widgets',
          },
          modelValue: null,
          selectOptions: graphOpts,
        },
      })
        .onOk((value) => resolve(value))
        .onCancel(() => resolve(null))
        .onDismiss(() => resolve(null));
    } else {
      createDialog({
        component: 'WidgetWizardDialog',
        componentProps: { featureId: graphType },
      })
        .onOk((widget: Maybe<Widget>) => resolve(widget?.id ?? null))
        .onCancel(() => resolve(null))
        .onDismiss(() => resolve(null));
    }
  });

  if (widgetId) {
    addBlockGraph(widgetId, block);
  }
}

export async function startAddBlockToDisplay(
  addr: BlockAddress,
  options: Partial<DisplayOpts> = {},
): Promise<void> {
  const display = getDisplaySettingsBlock(addr?.serviceId);
  if (!addr || !addr.id || !addr.type || !display) {
    return;
  }

  const { widgets } = display.data;
  const takenPos = widgets.map((w) => w.pos);
  const opts: DisplayOpts = {
    pos: range(1, 7).find((v) => !takenPos.includes(v)),
    color: '4169E1',
    name: addr.id,
    unique: true,
    showNotify: true,
    showDialog: true,
    ...options,
  };

  if (!isBlockDisplayReady(addr)) {
    notify.warn(`Block <i>${addr.id}</i> can't be shown on the Spark display`, {
      shown: opts.showNotify,
    });
  } else if (opts.unique && isBlockDisplayed(addr, display)) {
    notify.info(
      `Block <i>${addr.id}</i> is already shown on the Spark display`,
      { shown: opts.showNotify },
    );
  } else if (!opts.pos) {
    notify.info('Spark display is already full', { shown: opts.showNotify });
  } else {
    const { id, type } = addr;

    const link = bloxLink(id, type);
    const slot: DisplaySlot = {
      pos: opts.pos,
      color: opts.color,
      name: opts.name.slice(0, 15),
    };
    if (isCompatible(type, BlockIntfType.TempSensorInterface)) {
      slot.tempSensor = link;
    } else if (isCompatible(type, BlockIntfType.SetpointSensorPairInterface)) {
      slot.setpointSensorPair = link;
    } else if (isCompatible(type, BlockIntfType.ActuatorAnalogInterface)) {
      slot.actuatorAnalog = link;
    } else if (isCompatible(type, BlockType.Pid)) {
      slot.pid = link;
    }

    await useSparkStore().patchBlock(display, {
      widgets: [slot, ...widgets.filter((w) => w.pos !== opts.pos)],
    });
    notify.info(`Added <i>${addr.id}</i> to the Spark display`, {
      shown: opts.showNotify,
    });
  }

  if (opts.showDialog) {
    createBlockDialog(display);
  }

  // Make sure the display widget is updated in pinia before next call
  // TODO(Bob) nicer solution
  await new Promise((r) => setTimeout(r, 50));
}

export async function resetBlocks(
  serviceId: string,
  opts: { restore: boolean },
): Promise<void> {
  try {
    const addresses: Mapped<string> = {};
    const sparkStore = useSparkStore();

    if (!sparkStore.has(serviceId)) {
      throw new Error(`Service <b>${serviceId}</b> not found`);
    }

    if (opts.restore) {
      sparkStore
        .blocksByService(serviceId)
        .filter(
          (block) =>
            isBlockCompatible(block, BlockIntfType.OneWireDeviceInterface) &&
            !block.id.startsWith('New|'),
        )
        .forEach((block) => (addresses[block.data.address] = block.id));
    }

    await sparkStore.clearBlocks(serviceId);
    await sparkStore.fetchDiscoveredBlocks(serviceId);
    await sparkStore.fetchBlocks(serviceId);

    if (opts.restore) {
      const renaming: Promise<void>[] = sparkStore
        .blocksByService(serviceId)
        .filter(
          (block) =>
            isBlockCompatible(block, BlockIntfType.OneWireDeviceInterface) &&
            !!addresses[block.data.address],
        )
        .map((block) =>
          sparkStore.renameBlock(
            serviceId,
            block.id,
            addresses[block.data.address],
          ),
        );
      await Promise.all(renaming);
    }
    notify.done(
      'Removed all blocks' +
        (opts.restore ? ', and restored discovered blocks' : ''),
    );
  } catch (e: any) {
    notify.error(`Failed to remove blocks: ${e.toString()}`);
  }
}

export function startResetBlocks(serviceId: string): void {
  createDialog({
    component: 'CheckboxDialog',
    componentProps: {
      title: 'Reset blocks',
      message: `This will remove all blocks on <b>${serviceId}</b>. Are you sure?`,
      html: true,
      selectOptions: [
        { label: 'Remember names of discovered blocks', value: 0 },
      ],
      modelValue: [0, 1], // pre-check default actions
    },
    noBackdropDismiss: true,
  }).onOk((selected: number[]) =>
    resetBlocks(serviceId, {
      restore: selected.includes(0),
    }),
  );
}

export function startShowBlockJson(block: Block): void {
  createDialog({
    component: 'BlockJsonDialog',
    componentProps: {
      address: asBlockAddress(block),
    },
  });
}
