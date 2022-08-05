import { useBuilderStore } from '@/plugins/builder/store';
import { useBlockSpecStore, useSparkStore } from '@/plugins/spark/store';
import { startAddBlockToDisplay } from '@/plugins/spark/utils/actions';
import { Dashboard, useDashboardStore } from '@/store/dashboards';
import { useWidgetStore } from '@/store/widgets';
import { makeTypeFilter, nullFilter, uniqueFilter } from '@/utils/functional';
import { notify } from '@/utils/notify';
import { deepCopy } from '@/utils/objects';
import { bloxQty, inverseTempQty } from '@/utils/quantity';
import {
  BlockType,
  DigitalActuatorBlock,
  OneWireGpioModuleBlock,
  PidBlock,
} from 'brewblox-proto/ts';
import {
  GpioChange,
  IoChannelAddress,
  PidConfig,
  QuickstartAction,
  QuickstartConfig,
  QuickstartPatch,
} from './types';

const digitalActuatorFilter = makeTypeFilter<DigitalActuatorBlock>(
  BlockType.DigitalActuator,
);

const oneWireGpioFilter = makeTypeFilter<OneWireGpioModuleBlock>(
  BlockType.OneWireGpioModule,
);

export function resetGpioChanges(serviceId: string): GpioChange[] {
  return useSparkStore()
    .blocksByService(serviceId)
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
): QuickstartPatch<DigitalActuatorBlock>[] {
  return (
    useSparkStore()
      .blocksByService(serviceId)
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
      .map((block) => ({
        blockId: block.id,
        patch: { channel: 0 },
      }))
  );
}

export function changedIoModules(
  serviceId: string,
  changes: GpioChange[],
): QuickstartPatch<OneWireGpioModuleBlock>[] {
  return changes.map((change) => {
    const { blockId, channels } = change;
    return { blockId, patch: { channels } };
  });
}

export function createOutputActions(): QuickstartAction[] {
  const sparkStore = useSparkStore();
  const widgetStore = useWidgetStore();
  const dashboardStore = useDashboardStore();
  const builderStore = useBuilderStore();

  return [
    // Rename blocks
    async (config: QuickstartConfig) => {
      await Promise.all(
        Object.entries(config.renamedBlocks)
          .filter(
            ([currVal, newVal]: [string, string]) =>
              newVal && currVal !== newVal,
          )
          .map(([currVal, newVal]: [string, string]) =>
            sparkStore.renameBlock(config.serviceId, currVal, newVal),
          ),
      );
    },

    // Change blocks
    async (config: QuickstartConfig) => {
      await Promise.all(
        config.changedBlocks.map((change) =>
          sparkStore.patchBlock(
            sparkStore.blockById(config.serviceId, change.blockId),
            change.patch,
          ),
        ),
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
  useBlockSpecStore().blockSpecByType(BlockType.Pid).generate();

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
