import isEmpty from 'lodash/isEmpty';
import { nanoid } from 'nanoid';
import { Plugin } from 'vue';

import { WidgetFeature, useFeatureStore } from '@/store/features';
import { useSystemStore } from '@/store/system';
import { Widget } from '@/store/widgets';
import { cref } from '@/utils/component-ref';
import { isQuantity } from '@/utils/identity';
import { bloxQty } from '@/utils/quantity';

import widget from './QuickActionsWidget.vue';
import { QuickActionsConfig, QuickActionsConfigOld } from './types';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();

    const feature: WidgetFeature<QuickActionsConfig> = {
      id: 'QuickActions',
      title: 'Quick Actions',
      component: cref(app, widget),
      wizard: true,
      widgetSize: {
        cols: 4,
        rows: 5,
      },
      generateConfig: () => ({
        version: '1.0',
        actions: [
          {
            id: nanoid(),
            name: 'Example action - click to edit',
            changes: [],
          },
        ],
      }),
      upgrade: (widget: Widget<unknown>): Widget<QuickActionsConfig> | null => {
        let dirty = false;

        const systemStore = useSystemStore();
        const systemTemp = systemStore.units.temperature;
        const otherTemp = systemTemp === 'degC' ? 'degF' : 'degC';

        const config = widget.config as QuickActionsConfig &
          QuickActionsConfigOld;

        if (config.version !== '1.0') {
          if (config.steps) {
            dirty = true;
            config.actions = config.steps;
            config.steps = undefined;
          }

          // Change IDs were added after initial release
          config.actions.forEach((action) =>
            action.changes
              .filter((change) => change.id === undefined)
              .forEach((change) => {
                change.id = nanoid();
                dirty = true;
              }),
          );

          // Service IDs became a key of individual changes
          config.actions.forEach((action) =>
            action.changes
              .filter((change) => change.serviceId === undefined)
              .forEach((change) => {
                change.serviceId = config.serviceId!;
                dirty = true;
              }),
          );

          config.version = '1.0';
        }

        // Convert units if user changed system temperature
        config.actions.forEach((action) =>
          action.changes.forEach((change) => {
            const updates: AnyDict = {};
            for (const key in change.data) {
              const value = change.data[key];
              if (isQuantity(value) && value.unit.includes(otherTemp)) {
                updates[key] = bloxQty(value)
                  .to(value.unit.replace(otherTemp, systemTemp))
                  .toJSON();
              }
            }
            if (!isEmpty(updates)) {
              dirty = true;
              change.data = {
                ...change.data,
                ...updates,
              };
            }
          }),
        );

        if (dirty) {
          // Recreate to lose unexpected properties
          const upgraded: Widget<QuickActionsConfig> = {
            ...widget,
            config: {
              version: '1.0',
              actions: config.actions,
              lastActionId: config.lastActionId,
            },
          };
          return upgraded;
        }

        return null;
      },
    };

    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
