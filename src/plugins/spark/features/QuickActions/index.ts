import { useFeatureStore, WidgetFeature } from '@/store/features';
import { Widget } from '@/store/widgets';
import { cref } from '@/utils/component-ref';
import { nanoid } from 'nanoid';
import { Plugin } from 'vue';
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
        version: '1.2',
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

        const config = widget.config as QuickActionsConfig &
          QuickActionsConfigOld;

        if (config.version !== '1.2') {
          dirty = true;

          if (config.steps) {
            config.actions = config.steps;
            config.steps = undefined;
          }

          config.actions.forEach((action) => {
            // Change IDs were added after initial release
            action.changes
              .filter((change) => change.id === undefined)
              .forEach((change) => {
                change.id = nanoid();
              });

            // Service IDs became a key of individual changes
            action.changes
              .filter((change) => change.serviceId === undefined)
              .forEach((change) => {
                change.serviceId = config.serviceId!;
              });

            // The editable setting moved from 'desiredSetting' to 'storedSetting'
            action.changes
              .filter((change) => change.data.desiredSetting !== undefined)
              .forEach((change) => {
                change.data.storedSetting = change.data.desiredSetting;
                change.data.desiredSetting = undefined;
              });

            // The editable setting moved from 'desiredState' to 'storedState'
            action.changes
              .filter((change) => change.data.desiredState !== undefined)
              .forEach((change) => {
                change.data.storedState = change.data.desiredState;
                change.data.desiredState = undefined;
              });

            // Setpoint 'settingEnabled' was renamed to 'enabled'
            action.changes
              .filter((change) => change.data.settingEnabled !== undefined)
              .forEach((change) => {
                change.data.enabled = change.data.settingEnabled;
                change.data.settingEnabled = undefined;
              });
          });
        }

        if (dirty) {
          // Recreate to exclude unexpected properties
          const upgraded: Widget<QuickActionsConfig> = {
            ...widget,
            config: {
              version: '1.2',
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
