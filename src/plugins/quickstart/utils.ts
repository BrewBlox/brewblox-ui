import isEqual from 'lodash/isEqual';

import { builderStore } from '@/plugins/builder/store';
import { sparkStore } from '@/plugins/spark/store';
import { BlockType, DigitalActuatorBlock, PidBlock } from '@/plugins/spark/types';
import { tryDisplayBlock } from '@/plugins/spark/utils';
import { Dashboard, dashboardStore } from '@/store/dashboards';
import { widgetStore } from '@/store/widgets';
import { bloxQty, inverseTempQty } from '@/utils/bloxfield';
import { combinations, typeMatchFilter } from '@/utils/functional';
import notify from '@/utils/notify';

import { PidConfig, PinChannel, QuickstartAction, QuickstartConfig } from './types';

const digitalActuatorFilter = typeMatchFilter<DigitalActuatorBlock>(BlockType.DigitalActuator);

export function unlinkedActuators(serviceId: string, pins: PinChannel[]): DigitalActuatorBlock[] {
  return sparkStore
    .serviceBlocks(serviceId)
    .filter(digitalActuatorFilter)
    // Find existing drivers
    .filter(
      block => pins
        .some((pin: PinChannel) =>
          pin.arrayId === block.data.hwDevice.id
          && pin.pinId === block.data.channel))
    // Unlink them from pin
    .map((block) => {
      block.data.channel = 0;
      return block;
    });
}

export function createOutputActions(): QuickstartAction[] {
  return [
    // Rename blocks
    async (config: QuickstartConfig) => {
      const module = sparkStore.moduleById(config.serviceId)!;
      await Promise.all(
        Object.entries(config.renamedBlocks)
          .filter(([currVal, newVal]: [string, string]) => newVal && currVal !== newVal)
          .map(([currVal, newVal]: [string, string]) => module.renameBlock([currVal, newVal])),
      );
    },

    // Change blocks
    async (config: QuickstartConfig) => {
      await Promise.all(
        config.changedBlocks
          .map(block => sparkStore.saveBlock(block)),
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
      await Promise.all(
        config.layouts
          .map(builderStore.createLayout),
      );
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
        await tryDisplayBlock(block!, val.opts);
      }
    },
  ];
}

export async function executeActions(actions: QuickstartAction[], config: AnyDict): Promise<void> {
  try {
    // We're intentionally waiting for each async function
    // Actions may be async, but can have dependencies
    for (const func of actions) {
      await func(config);
    }
    notify.done('Wizard done!');
  } catch (e) {
    notify.error(`Failed to execute actions: ${e.message}`);
  }
}

export function hasShared<T>(arr: T[]): boolean {
  return combinations(arr.filter(v => v !== null)).some(([v1, v2]) => isEqual(v1, v2));
}

export function withPrefix(prefix: string, val: string): string {
  return !!prefix
    ? `${prefix} ${val}`
    : val;
}

export function withoutPrefix(prefix: string, val: string): string {
  return val.startsWith(prefix)
    ? val.substring(prefix.length).trim()
    : val;
}

export const pidDefaults = (): PidBlock['data'] =>
  sparkStore.specById(BlockType.Pid).generate();

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
