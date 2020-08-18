import isEqual from 'lodash/isEqual';

import { typeMatchFilter } from '@/helpers/functional';
import { builderStore } from '@/plugins/builder/store';
import { tryDisplayBlock } from '@/plugins/spark/helpers';
import { sparkStore } from '@/plugins/spark/store';
import { BlockType, DigitalActuatorBlock, PidBlock } from '@/plugins/spark/types';
import { Dashboard, dashboardStore } from '@/store/dashboards';

import { WizardAction } from './components/QuickStartTaskBase';
import { PinChannel, QuickStartOutput } from './types';

export function unlinkedActuators(serviceId: string, pins: PinChannel[]): DigitalActuatorBlock[] {
  return sparkStore
    .serviceBlocks(serviceId)
    // Find existing drivers
    .filter(typeMatchFilter<DigitalActuatorBlock>(BlockType.DigitalActuator))
    .filter(
      block => pins
        .some((pin: PinChannel) =>
          pin.arrayId === block.data.hwDevice.id
          && pin.pinId === block.data.channel))
    // Unlink them from pin
    .map((block) => {
      block.data.channel = 0;
      return block as DigitalActuatorBlock;
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

function combinations<T>(arr: T[]): [T, T][] {
  const results: [T, T][] = [];
  // last element is skipped
  for (let i = 0; i < arr.length - 1; i++) {
    // Capture the second part of the combination
    for (let j = i + 1; j < arr.length; j++) {
      results.push([arr[i], arr[j]]);
    }
  }
  return results;
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
