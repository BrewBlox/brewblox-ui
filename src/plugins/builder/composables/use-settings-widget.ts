import { PartKey, PatchSettingsKey } from '../symbols';
import { settingsProp } from '../utils';
import { useDashboardStore } from '@/store/dashboards';
import { useWidgetStore, Widget } from '@/store/widgets';
import { createDialog } from '@/utils/dialog';
import { makeObjectSorter } from '@/utils/functional';
import { computed, ComputedRef, inject } from 'vue';

export interface UseSettingsWidgetComponent {
  widgetId: ComputedRef<string | undefined>;
  widget: ComputedRef<Widget | null>;
  isBroken: ComputedRef<boolean>;
  showWidgetDialog: () => void;
  showWidgetSelectDialog: () => void;
}

export interface UseSettingsWidgetComposable {
  setup(settingsKey: string, type: string): UseSettingsWidgetComponent;
}

export const useSettingsWidget: UseSettingsWidgetComposable = {
  setup(settingsKey: string, type: string): UseSettingsWidgetComponent {
    const widgetStore = useWidgetStore();
    const dashboardStore = useDashboardStore();
    const part = inject(PartKey)!;
    const patchSettings = inject(PatchSettingsKey, () => {});

    const widgetId = computed<string | undefined>(() =>
      settingsProp<string>(part.value.settings, settingsKey, 'string'),
    );

    const widget = computed<Widget | null>(() =>
      widgetStore.widgetById(widgetId.value),
    );

    const isBroken = computed<boolean>(() =>
      Boolean(widgetId.value && !widget.value),
    );

    function showWidgetDialog(): void {
      if (!widgetId.value) {
        return;
      }

      if (widgetStore.widgetIds.includes(widgetId.value)) {
        createDialog({
          component: 'WidgetDialog',
          componentProps: {
            mode: 'Basic',
            widgetId: widgetId.value,
          },
        });
      } else {
        createDialog({
          component: 'ConfirmDialog',
          componentProps: {
            title: 'Broken Link',
            message: 'Widget was not found. Use the editor to change the link.',
            cancel: false,
          },
        });
      }
    }

    function showWidgetSelectDialog(): void {
      const selectOptions: SelectOption[] = widgetStore.widgets
        .filter((v) => v.feature === type)
        .sort(makeObjectSorter('title'))
        .map((widget) => ({
          label: `[${dashboardStore.dashboardTitle(widget.dashboard)}] ${
            widget.title
          }`,
          value: widget.id,
        }));

      createDialog({
        component: 'SelectDialog',
        componentProps: {
          modelValue: widgetId.value,
          title: 'Select widget',
          selectOptions,
          selectProps: {
            label: 'Widget',
          },
        },
      }).onOk((id: string) => {
        patchSettings({ [settingsKey]: id });
      });
    }

    return {
      widgetId,
      widget,
      isBroken,
      showWidgetDialog,
      showWidgetSelectDialog,
    };
  },
};
