import isEqual from 'lodash/isEqual';

import { bloxQty } from '@/helpers/bloxfield';
import { combinations, typeMatchFilter } from '@/helpers/functional';
import { builderStore } from '@/plugins/builder/store';
import { tryDisplayBlock } from '@/plugins/spark/helpers';
import { sparkStore } from '@/plugins/spark/store';
import { BlockType, DigitalActuatorBlock, PidBlock } from '@/plugins/spark/types';
import { Dashboard, dashboardStore } from '@/store/dashboards';

import { WizardAction } from './components/QuickStartTaskBase';
import { PidConfig, PinChannel, QuickStartOutput } from './types';

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

export function createOutputActions(): WizardAction[] {
  return [
    // Rename blocks
    async (config: QuickStartOutput) => {
      const module = sparkStore.moduleById(config.serviceId)!;
      await Promise.all(
        Object.entries(config.renamedBlocks)
          .filter(([currVal, newVal]: [string, string]) => currVal !== newVal)
          .map(([currVal, newVal]: [string, string]) => module.renameBlock([currVal, newVal]))
      );
    },

    // Change blocks
    async (config: QuickStartOutput) => {
      await Promise.all(
        config.changedBlocks
          .map(block => sparkStore.saveBlock(block))
      );
    },

    // Create blocks
    async (config: QuickStartOutput) => {
      // Create synchronously, to ensure dependencies are created first
      for (const block of config.createdBlocks) {
        await sparkStore.createBlock(block);
      }
    },

    // Create layouts
    async (config: QuickStartOutput) => {
      await Promise.all(
        config.layouts
          .map(builderStore.createLayout)
      );
    },

    // Create dashboards / widgets
    async (config: QuickStartOutput) => {
      if (!dashboardStore.dashboardIds.includes(config.dashboardId)) {
        const dashboard: Dashboard = {
          id: config.dashboardId,
          title: config.dashboardTitle,
          order: dashboardStore.dashboardIds.length + 1,
        };
        await dashboardStore.createDashboard(dashboard);
      }
      for (const widget of config.widgets) {
        await dashboardStore.appendWidget(widget);
      }
    },

    // Add blocks to LCD display
    async (config: QuickStartOutput) => {
      for (const val of config.displayedBlocks) {
        const block = sparkStore.blockById(config.serviceId, val.blockId);
        await tryDisplayBlock(block!, val.opts);
      }
    },
  ];
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

export function pidDefaults(serviceId: string): PidBlock['data'] {
  return sparkStore.specById(BlockType.Pid).generate(serviceId);
}

export const makeBeerCoolConfig = (): PidConfig => ({
  kp: bloxQty(-50, '1/degC'),
  ti: bloxQty('6h'),
  td: bloxQty('30m'),
});

export const makeBeerHeatConfig = (): PidConfig => ({
  kp: bloxQty(100, '1/degC'),
  ti: bloxQty('6h'),
  td: bloxQty('30m'),
});

export const makeFridgeCoolConfig = (): PidConfig => ({
  kp: bloxQty(-20, '1/degC'),
  ti: bloxQty('2h'),
  td: bloxQty('10m'),
});

export const makeFridgeHeatConfig = (): PidConfig => ({
  kp: bloxQty(20, '1/degC'),
  ti: bloxQty('2h'),
  td: bloxQty('10m'),
});
