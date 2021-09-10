import { builderStore } from '@/plugins/builder/store';
import { sparkStore } from '@/plugins/spark/store';
import {
  BlockType,
  DigitalActuatorBlock,
  OneWireGpioModuleBlock,
  PidBlock,
} from '@/plugins/spark/types';
import { startAddBlockToDisplay } from '@/plugins/spark/utils';
import { Dashboard, dashboardStore } from '@/store/dashboards';
import { widgetStore } from '@/store/widgets';
import { makeTypeFilter, nullFilter, uniqueFilter } from '@/utils/functional';
import { notify } from '@/utils/notify';
import { deepCopy } from '@/utils/objects';
import { bloxQty, inverseTempQty } from '@/utils/quantity';

import {
  GpioChange,
  IoChannelAddress,
  PidConfig,
  QuickstartAction,
  QuickstartConfig,
} from './types';

const digitalActuatorFilter = makeTypeFilter<DigitalActuatorBlock>(
  BlockType.DigitalActuator,
);

const oneWireGpioFilter = makeTypeFilter<OneWireGpioModuleBlock>(
  BlockType.OneWireGpioModule,
);

export function resetGpioChanges(serviceId: string): GpioChange[] {
  return sparkStore
    .serviceBlocks(serviceId)
    .filter(oneWireGpioFilter)
    .sort((a, b) => a.data.modulePosition - b.data.modulePosition)
    .map((block) => ({
      blockId: block.id,
      modulePosition: block.data.modulePosition,
      channels: deepCopy(block.data.channels),
    }));
}

export function unlinkedActuators(
  serviceId: string,
  channels: IoChannelAddress[],
): DigitalActuatorBlock[] {
  return (
    sparkStore
      .serviceBlocks(serviceId)
      .filter(digitalActuatorFilter)
      // Find existing drivers
      .filter((block) =>
        channels.some(
          (channel: IoChannelAddress) =>
            channel.blockId === block.data.hwDevice.id &&
            channel.channelId === block.data.channel,
        ),
      )
      // Unlink them from channel
      .map((block) => {
        block.data.channel = 0;
        return block;
      })
  );
}

export function changedIoModules(
  serviceId: string,
  changes: GpioChange[],
): OneWireGpioModuleBlock[] {
  return changes
    .map((change) => {
      const block = sparkStore.blockById<OneWireGpioModuleBlock>(
        serviceId,
        change.blockId,
      );
      if (block) {
        block.data.channels = change.channels;
      }
      return block;
    })
    .filter(nullFilter);
}

export function createOutputActions(): QuickstartAction[] {
  return [
    // Rename blocks
    async (config: QuickstartConfig) => {
      const module = sparkStore.moduleById(config.serviceId)!;
      await Promise.all(
        Object.entries(config.renamedBlocks)
          .filter(
            ([currVal, newVal]: [string, string]) =>
              newVal && currVal !== newVal,
          )
          .map(([currVal, newVal]: [string, string]) =>
            module.renameBlock([currVal, newVal]),
          ),
      );
    },

    // Change blocks
    async (config: QuickstartConfig) => {
      await Promise.all(
        config.changedBlocks.map((block) => sparkStore.saveBlock(block)),
      );
    },

    // Create blocks
    async (config: QuickstartConfig) => {
      // Create synchronously, to ensure dependencies are created first
      for (const block of config.createdBlocks) {
        await sparkStore.createBlock(block);
      }
    },

    // Create layouts
    async (config: QuickstartConfig) => {
      await Promise.all(config.layouts.map(builderStore.createLayout));
    },

    // Create dashboards / widgets
    async (config: QuickstartConfig) => {
      if (!dashboardStore.dashboardIds.includes(config.dashboardId)) {
        const dashboard: Dashboard = {
          id: config.dashboardId,
          title: config.dashboardTitle,
          order: dashboardStore.dashboardIds.length + 1,
        };
        await dashboardStore.createDashboard(dashboard);
      }
      for (const widget of config.widgets) {
        await widgetStore.appendWidget(widget);
      }
    },

    // Add blocks to LCD display
    async (config: QuickstartConfig) => {
      for (const val of config.displayedBlocks) {
        const block = sparkStore.blockById(config.serviceId, val.blockId);
        await startAddBlockToDisplay(block!, val.opts);
      }
    },
  ];
}

export async function executeActions(
  actions: QuickstartAction[],
  config: AnyDict,
): Promise<void> {
  try {
    // We're intentionally waiting for each async function
    // Actions may be async, but can have dependencies
    for (const func of actions) {
      await func(config);
    }
    notify.done('Wizard done!');
  } catch (e: any) {
    notify.error(`Failed to execute actions: ${e.message}`);
  }
}

export function channelsOverlap(
  channels: (IoChannelAddress | null)[],
): boolean {
  const listed = channels
    .filter(nullFilter)
    .map((addr) => `${addr.blockId} ${addr.channelId}`);
  return new Set(listed).size < listed.length;
}

export function hasShared(arr: any[]): boolean {
  const base = deepCopy(arr).filter(nullFilter);
  const unique = base.filter(uniqueFilter);
  return base.length > unique.length;
}

export function withPrefix(prefix: string, val: string): string {
  return !!prefix ? `${prefix} ${val}` : val;
}

export function withoutPrefix(prefix: string, val: string): string {
  return val.startsWith(prefix) ? val.substring(prefix.length).trim() : val;
}

export const pidDefaults = (): PidBlock['data'] =>
  sparkStore.blockSpecByType(BlockType.Pid).generate();

export const makeBeerCoolConfig = (): PidConfig => ({
  kp: inverseTempQty(-50),
  ti: bloxQty('6h'),
  td: bloxQty('30m'),
});

export const makeBeerHeatConfig = (): PidConfig => ({
  kp: inverseTempQty(100),
  ti: bloxQty('6h'),
  td: bloxQty('30m'),
});

export const makeFridgeCoolConfig = (): PidConfig => ({
  kp: inverseTempQty(-20),
  ti: bloxQty('2h'),
  td: bloxQty('10m'),
});

export const makeFridgeHeatConfig = (): PidConfig => ({
  kp: inverseTempQty(20),
  ti: bloxQty('2h'),
  td: bloxQty('10m'),
});
