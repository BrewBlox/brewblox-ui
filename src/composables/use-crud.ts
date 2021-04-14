import cloneDeep from 'lodash/cloneDeep';
import { nanoid } from 'nanoid';
import { computed, ComputedRef, PropType } from 'vue';

import { dashboardStore, Widget } from '@/store/dashboards';
import { Crud, featureStore } from '@/store/features';
import { createDialog } from '@/utils/dialog';
import notify from '@/utils/notify';

export interface UseCrudProps {
  crud: {
    type: PropType<Crud>,
    required: true,
  }
}

export interface UseCrudComponent<ConfigT> {
  crud: Crud<ConfigT>;
  featureTitle: ComputedRef<string>;
  saveWidget(widget?: Widget<ConfigT>): Promise<void>;
  saveConfig(config?: ConfigT): Promise<void>;
  startChangeWidgetTitle(): void;
  startCopyWidget(): void;
  startMoveWidget(): void;
  startRemoveWidget(): void;
}

export interface UseCrudComposable {
  props: UseCrudProps;
  setup<ConfigT>(crud: Crud<ConfigT>): UseCrudComponent<ConfigT>;
}

export const useCrud: UseCrudComposable = {
  props: {
    crud: {
      type: Object as PropType<Crud>,
      required: true,
    },
  },
  setup<ConfigT>(crud: Crud<ConfigT>) {
    const featureTitle = computed<string>(
      () => featureStore.widgetTitle(crud.widget.feature) ?? crud.widget.feature,
    );

    async function saveWidget(widget: Widget<ConfigT>): Promise<void> {
      await crud.saveWidget(widget);
    }

    async function saveConfig(config: ConfigT): Promise<void> {
      await crud.saveWidget({ ...crud.widget, config });
    }

    function startChangeWidgetTitle(): void {
      const widgetTitle = crud.widget.title;
      createDialog({
        component: 'InputDialog',
        componentProps: {
          modelValue: widgetTitle,
          title: 'Change widget name',
          message: `Choose a new name for <b>${widgetTitle}</b>.`,
          html: true,
          clearable: false,
        },
      })
        .onOk((title: string) => saveWidget({ ...crud.widget, title }));
    }

    function startCopyWidget(): void {
      const id = nanoid();
      const selectOptions = dashboardStore
        .dashboards
        .map(dashboard => ({ label: dashboard.title, value: dashboard.id }));

      createDialog({
        component: 'SelectDialog',
        componentProps: {
          modelValue: null,
          title: 'Copy widget',
          message: `To which dashboard do you want to copy <b>${crud.widget.title}</b>?`,
          html: true,
          listSelect: selectOptions.length < 10,
          selectOptions,
        },
      })
        .onOk((dashboard: string) => {
          if (dashboard) {
            dashboardStore.appendWidget({ ...cloneDeep(crud.widget), id, dashboard, pinnedPosition: null });
            notify.done(`Copied <b>${crud.widget.title}</b> to <b>${dashboardStore.dashboardTitle(dashboard)}</b>`);
          }
        });
    }

    function startMoveWidget(): void {
      const selectOptions = dashboardStore
        .dashboards
        .filter(dashboard => dashboard.id !== crud.widget.dashboard)
        .map(dashboard => ({ label: dashboard.title, value: dashboard.id }));

      createDialog({
        component: 'SelectDialog',
        componentProps: {
          modelValue: null,
          title: 'Move widget',
          message: `To which dashboard do you want to move <b>${crud.widget.title}</b>?`,
          listSelect: selectOptions.length < 10,
          html: true,
          selectOptions,
        },
      })
        .onOk((dashboard: string) => {
          if (dashboard) {
            saveWidget({ ...crud.widget, dashboard, pinnedPosition: null });
            notify.done(`Moved <b>${crud.widget.title}</b> to <b>${dashboardStore.dashboardTitle(dashboard)}</b>`);
          }
        });
    }

    function startRemoveWidget(): void {
      // Quasar dialog can't handle objects as value - they will be returned as null
      // As workaround, we use array index as value, and add the "action" key to each option
      const selectOptions = [
        {
          label: 'Remove widget from this dashboard',
          value: 0,
          action: () => dashboardStore.removeWidget(crud.widget),
        },
        ...featureStore
          .widgetRemoveActions(crud.widget.feature)
          .map((opt, idx) => ({
            label: opt.description,
            value: idx + 1,
            action: opt.action,
          })),
      ];

      createDialog({
        component: 'CheckboxDialog',
        componentProps: {
          title: 'Remove widget',
          message: `How do you want to remove widget <b>${crud.widget.title}</b>?`,
          html: true,
          modelValue: [0], // pre-check the default action
          selectOptions,
        },
      })
        .onOk((selected: number[]) => {
          selected.forEach(idx => selectOptions[idx].action(crud));
          // closeDialog();
        });
    }

    return {
      crud,
      featureTitle,
      saveWidget,
      saveConfig,
      startChangeWidgetTitle,
      startCopyWidget,
      startMoveWidget,
      startRemoveWidget,
    };
  },
};

// TODO: showDialog/hideDialog
