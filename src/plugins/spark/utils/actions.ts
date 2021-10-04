import isMatch from 'lodash/isMatch';
import range from 'lodash/range';

import { typeName as graphType } from '@/plugins/history/Graph/const';
import { addBlockGraph } from '@/plugins/history/Graph/utils';
import { useSparkStore } from '@/plugins/spark/store';
import { BlockAddress, DisplayOpts } from '@/plugins/spark/types';
import { createWidgetWizard } from '@/plugins/wizardry';
import {
  Block,
  BlockIntfType,
  BlockType,
  DigitalActuatorBlock,
  DisplaySlot,
  DS2408Block,
  IoArrayBlock,
  MotorValveBlock,
} from '@/shared-types';
import { useDashboardStore } from '@/store/dashboards';
import { useWidgetStore } from '@/store/widgets';
import { createBlockDialog, createDialog } from '@/utils/dialog';
import { saveFile } from '@/utils/import-export';
import { bloxLink } from '@/utils/link';
import { notify } from '@/utils/notify';
import { matchesType } from '@/utils/objects';

import { makeBlockIdRules } from './configuration';
import { channelName } from './formatting';
import {
  isBlockDisplayed,
  isBlockDisplayReady,
  isBlockVolatile,
  isCompatible,
} from './info';
import { getDisplaySettingsBlock } from './system';

export function startChangeBlockId(block: Block | null): void {
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
    if (!sparkStore.has(block.serviceId)) {
      return;
    } else if (isBlockVolatile(block)) {
      sparkStore.saveBlock({ ...block, id: newId });
    } else {
      sparkStore.renameBlock(block.serviceId, block.id, newId).catch(() => {});
    }
  });
}

export function startRemoveBlock(block: Block | null): void {
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
      createWidgetWizard(graphType)
        .onOk((output) => resolve(output.widget?.id ?? null))
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
  } else if (opts.unique && isBlockDisplayed(addr)) {
    notify.info(
      `Block <i>${addr.id}</i> is already shown on the Spark display`,
      { shown: opts.showNotify },
    );
  } else if (!opts.pos) {
    notify.info('Spark display is already full', { shown: opts.showNotify });
  } else {
    const { id, type } = addr;

    const link = bloxLink(id, type as BlockType);
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

    display.data.widgets = [
      slot,
      ...display.data.widgets.filter((w) => w.pos !== opts.pos),
    ];
    await useSparkStore().saveBlock(display);
    notify.info(`Added <i>${addr.id}</i> to the Spark display`, {
      shown: opts.showNotify,
    });
  }

  if (opts.showDialog) {
    createBlockDialog(display);
  }
}

export function saveHwInfo(serviceId: string): void {
  const linked: string[] = [];
  const addressed: string[] = [];
  const sparkStore = useSparkStore();

  sparkStore.blocksByService(serviceId).forEach((block) => {
    if (matchesType<MotorValveBlock>(BlockType.MotorValve, block)) {
      const { hwDevice, startChannel } = block.data;
      if (hwDevice.id === null || !startChannel) {
        return;
      }
      const target = sparkStore.blockById<DS2408Block>(serviceId, hwDevice.id);
      if (target) {
        linked.push(
          `${block.id}: ${target.id} ${channelName(target, startChannel)}`,
        );
      }
    }

    if (matchesType<DigitalActuatorBlock>(BlockType.DigitalActuator, block)) {
      const { hwDevice, channel } = block.data;
      if (hwDevice.id === null || !channel) {
        return;
      }
      const target = sparkStore.blockById<IoArrayBlock>(serviceId, hwDevice.id);
      if (target) {
        linked.push(
          `${block.id}: ${target.id} ${channelName(target, channel)}`,
        );
      }
    }

    if ('address' in block.data) {
      addressed.push(`${block.id}: ${block.data.address}`);
    }
  });

  const lines = [
    `Service: ${serviceId}`,
    `Date: ${new Date().toLocaleString()}`,
    '\n[Actuators]',
    ...linked,
    '\n[OneWire addresses]',
    ...addressed,
  ];
  saveFile(lines.join('\n'), `spark-hardware-${serviceId}.txt`, true);
}

export async function resetBlocks(
  serviceId: string,
  opts: { restore: boolean; download: boolean },
): Promise<void> {
  try {
    const addresses: Mapped<string> = {};
    const sparkStore = useSparkStore();

    if (!module) {
      throw new Error(`Service <b>${serviceId}</b> not found`);
    }

    if (opts.download) {
      saveHwInfo(serviceId);
    }

    if (opts.restore) {
      sparkStore
        .blocksByService(serviceId)
        .filter(
          (block) =>
            isCompatible(block.type, BlockIntfType.OneWireDeviceInterface) &&
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
            isCompatible(block.type, BlockIntfType.OneWireDeviceInterface) &&
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
  } catch (e) {
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
      noBackdropDismiss: true,
      selectOptions: [
        { label: 'Remember names of discovered blocks', value: 0 },
        { label: 'Export sensor and pin names', value: 1 },
      ],
      modelValue: [0, 1], // pre-check default actions
    },
  }).onOk((selected: number[]) =>
    resetBlocks(serviceId, {
      restore: selected.includes(0),
      download: selected.includes(1),
    }),
  );
}
