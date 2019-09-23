import { WizardAction } from '@/components/Wizard/WizardTaskBase';
import { builderStore } from '@/plugins/builder/store';
import { typeName as digiActType } from '@/plugins/spark/features/DigitalActuator/getters';
import { DigitalActuatorBlock } from '@/plugins/spark/features/DigitalActuator/types';
import { sparkStore } from '@/plugins/spark/store';
import { Dashboard, dashboardStore } from '@/store/dashboards';

import { PinChannel, QuickStartOutput } from './types';

export function unlinkedActuators(serviceId: string, pins: PinChannel[]): DigitalActuatorBlock[] {
  return sparkStore
    .blockValues(serviceId)
    // Find existing drivers
    .filter(
      block =>
        block.type === digiActType &&
        pins.some(
          (pin: PinChannel) => pin.arrayId === block.data.hwDevice.id && pin.pinId === block.data.channel
        )
    )
    // Unlink them from pin
    .map((block: DigitalActuatorBlock) => {
      block.data.channel = 0;
      return block;
    });
}

export function createOutputActions(): WizardAction[] {
  return [
    // Rename blocks
    async (config: QuickStartOutput) => {
      await Promise.all(
        Object.entries(config.renamedBlocks)
          .filter(([currVal, newVal]: [string, string]) => currVal !== newVal)
          .map(([currVal, newVal]: [string, string]) => sparkStore.renameBlock([config.serviceId, currVal, newVal]))
      );
    },

    // Change blocks
    async (config: QuickStartOutput) => {
      await Promise.all(
        config.changedBlocks
          .map(block => sparkStore.saveBlock([config.serviceId, block])));
    },

    // Create blocks
    async (config: QuickStartOutput) => {
      // Create synchronously, to ensure dependencies are created first
      for (const block of config.createdBlocks) {
        await sparkStore.createBlock([config.serviceId, block]);
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
        await dashboardStore.appendDashboardItem(widget);
      }
    },
  ];
}
