import { nanoid } from 'nanoid';
import { computed, ComputedRef, inject, Ref, ref, UnwrapRef, watch } from 'vue';

import { dashboardStore } from '@/store/dashboards';
import { featureStore } from '@/store/features';
import { Widget, widgetStore } from '@/store/widgets';
import { InvalidateKey, WidgetIdKey } from '@/symbols';
import { createDialog } from '@/utils/dialog';
import { deepCopy } from '@/utils/functional';
import notify from '@/utils/notify';

export interface UseWidgetComponent<WidgetT extends Widget> {
  widgetId: string;
  widget: Ref<UnwrapRef<WidgetT>>;
  config: ComputedRef<WidgetT['config']>;
  isVolatileWidget: ComputedRef<boolean>;
  featureTitle: ComputedRef<string>;

  saveWidget(widget?: WidgetT): Promise<void>;
  saveConfig(config?: WidgetT['config']): Promise<void>;
  invalidate(cb?: () => Awaitable<unknown>): void;

  startChangeWidgetTitle(): void;
  startCopyWidget(): void;
  startMoveWidget(): void;
  startRemoveWidget(): void;
}

export interface UseWidgetComposable {
  setup<WidgetT extends Widget>(): UseWidgetComponent<WidgetT>;
}

export const useWidget: UseWidgetComposable = {
  setup<WidgetT extends Widget>(): UseWidgetComponent<WidgetT> {
    const widgetId = inject(WidgetIdKey)!;
    const invalidate = inject(InvalidateKey)!;

    if (!widgetId) {
      throw new Error('No widget ID injected');
    }

    const widget = ref<WidgetT>(
      widgetStore.widgetById<WidgetT>(widgetId)!,
    );

    if (!widget.value) {
      throw new Error(`No widget found for ID ${widgetId}`);
    }

    watch(
      () => widgetStore.widgetById<WidgetT>(widgetId),
      (newV) => {
        if (newV) {
          widget.value = newV;
        }
        else {
          invalidate();
        }
      },
    );

    const config = computed<WidgetT['config']>(
      () => widget.value.config,
    );

    const isVolatileWidget = computed<boolean>(
      () => Boolean(widget.value.volatile),
    );

    const featureTitle = computed<string>(
      () => featureStore.widgetTitle(widget.value.feature) ?? widget.value.feature,
    );

    async function saveWidget(w: WidgetT = widget.value): Promise<void> {
      await widgetStore.saveWidget(w);
    }

    async function saveConfig(c: WidgetT['config'] = config.value): Promise<void> {
      await widgetStore.saveWidget({ ...widget.value, config: c });
    }

    // function invalidate(): void {
    //   invalidationTrigger.value = true;
    // }

    function startChangeWidgetTitle(): void {
      const widgetTitle = widget.value.title;
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
        .onOk((title: string) => saveWidget({ ...widget.value, title }));
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
          message: `To which dashboard do you want to copy <b>${widget.value.title}</b>?`,
          html: true,
          listSelect: selectOptions.length < 10,
          selectOptions,
        },
      })
        .onOk((dashboard: string) => {
          if (dashboard) {
            widgetStore.appendWidget({ ...deepCopy(widget.value), id, dashboard, pinnedPosition: null });
            notify.done(`Copied <b>${widget.value.title}</b> to <b>${dashboardStore.dashboardTitle(dashboard)}</b>`);
          }
        });
    }

    function startMoveWidget(): void {
      const selectOptions = dashboardStore
        .dashboards
        .filter(dashboard => dashboard.id !== widget.value.dashboard)
        .map(dashboard => ({ label: dashboard.title, value: dashboard.id }));

      createDialog({
        component: 'SelectDialog',
        componentProps: {
          modelValue: null,
          title: 'Move widget',
          message: `To which dashboard do you want to move <b>${widget.value.title}</b>?`,
          listSelect: selectOptions.length < 10,
          html: true,
          selectOptions,
        },
      })
        .onOk((dashboard: string) => {
          if (dashboard) {
            saveWidget({ ...widget.value, dashboard, pinnedPosition: null });
            notify.done(`Moved <b>${widget.value.title}</b> to <b>${dashboardStore.dashboardTitle(dashboard)}</b>`);
          }
        });
    }

    function startRemoveWidget(): void {
      const actions = featureStore.widgetRemoveActions(widget.value.feature);

      if (actions.length === 0) {
        createDialog({
          component: 'ConfirmDialog',
          componentProps: {
            title: 'Remove widget',
            message: `Are you sure you want to remove <b>${widget.value.title}</b>?`,
            html: true,
            ok: 'Yes',
            cancel: 'No',
          },
        })
          .onOk(() => widgetStore.removeWidget(widget.value));
      }
      else {
        // Quasar dialog can't handle objects as value - they will be returned as null
        // As workaround, we use array index as value, and add the "action" key to each option
        const selectOptions = [
          {
            label: 'Remove widget from this dashboard',
            value: 0,
            action: () => widgetStore.removeWidget(widget.value),
          },
          ...actions.map((opt, idx) => ({
            label: opt.description,
            value: idx + 1,
            action: opt.action,
          })),
        ];
        createDialog({
          component: 'CheckboxDialog',
          componentProps: {
            title: 'Remove widget',
            message: `How do you want to remove widget <b>${widget.value.title}</b>?`,
            html: true,
            modelValue: [0], // pre-check the default action
            selectOptions,
          },
        })
          .onOk((selected: number[]) => {
            selected.forEach(idx => selectOptions[idx].action(widget.value));
          });
      }
    }

    return {
      widgetId,
      widget,
      config,
      isVolatileWidget,
      featureTitle,
      saveWidget,
      saveConfig,
      invalidate,
      startChangeWidgetTitle,
      startCopyWidget,
      startMoveWidget,
      startRemoveWidget,
    };
  },
};
