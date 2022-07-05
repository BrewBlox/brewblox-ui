import { Dashboard, useDashboardStore } from '@/store/dashboards';
import { useSystemStore } from '@/store/system';
import { useWidgetStore } from '@/store/widgets';
import { userUISettings } from '@/user-settings';

import { createDialog } from './dialog';
import { notify } from './notify';
import { makeRuleValidator, suggestId } from './rules';
import { isUrlSafe, makeUrlSafe } from './url';

type IdChangedCallback = (id: string) => void;

export const makeDashboardIdRules = (): InputRule[] => [
  (v) => !!v || 'Value is required',
  (v) =>
    !useDashboardStore().dashboardIds.includes(v) || 'Value must be unique',
  (v) => isUrlSafe(v) || 'Value must be URL-safe',
];

async function execDashboardIdChange(
  oldId: string,
  newId: string,
  onIdChanged?: IdChangedCallback,
): Promise<void> {
  const dashboardStore = useDashboardStore();
  const widgetStore = useWidgetStore();
  const systemStore = useSystemStore();
  const dashboard = dashboardStore.dashboardById(oldId);
  if (!dashboard) {
    return;
  }

  await dashboardStore.createDashboard({ ...dashboard, id: newId });
  await Promise.all(
    widgetStore.widgets
      .filter((item) => item.dashboard === oldId)
      .map((item) => widgetStore.saveWidget({ ...item, dashboard: newId })),
  );
  await dashboardStore.removeDashboard({ ...dashboard });

  if (userUISettings.value.homePage === `/dashboard/${oldId}`) {
    await systemStore.patchUserUISettings({ homePage: `/dashboard/${newId}` });
  }

  notify.done(`Changed dashboard URL to <b>${newId}</b>`);
  onIdChanged?.(newId);
}

export function startChangeDashboardId(
  dashboard: Dashboard,
  onIdChanged?: IdChangedCallback,
): void {
  createDialog({
    component: 'InputDialog',
    componentProps: {
      modelValue: dashboard.id,
      title: 'Change dashboard URL',
      message: 'The dashboard URL is used as unique identifier.',
      rules: makeDashboardIdRules(),
    },
  }).onOk(async (newId: string) => {
    const oldId = dashboard.id;
    if (newId !== oldId) {
      await execDashboardIdChange(oldId, newId, onIdChanged);
    }
  });
}

export function startChangeDashboardTitle(
  dashboard: Dashboard,
  onIdChanged?: IdChangedCallback,
): void {
  createDialog({
    component: 'InputDialog',
    componentProps: {
      title: 'Rename dashboard',
      message:
        'This changes the dashboard display name, not its unique identifier.',
      modelValue: dashboard.title,
    },
  }).onOk(async (newTitle: string) => {
    const dashboardStore = useDashboardStore();
    const oldId = dashboard.id;
    const oldTitle = dashboard.title;
    if (!newTitle || oldTitle === newTitle) {
      return;
    }

    await dashboardStore.saveDashboard({ ...dashboard, title: newTitle });
    notify.done(`Renamed dashboard to <b>${newTitle}</b>`);

    const defaultId = makeUrlSafe(newTitle);
    if (oldId === defaultId) {
      return; // no change
    }
    const suggestedId = suggestId(
      defaultId,
      makeRuleValidator(makeDashboardIdRules()),
    );

    createDialog({
      component: 'ConfirmDialog',
      componentProps: {
        title: 'Update dashboard URL',
        message:
          'Do you want to change the dashboard URL ' +
          `from <b>${oldId}</b> to <b>${suggestedId}</b>?`,
        html: true,
        ok: 'Yes',
        cancel: 'No',
      },
    }).onOk(() => execDashboardIdChange(oldId, suggestedId, onIdChanged));
  });
}

export function startRemoveDashboard(dashboard: Dashboard): void {
  createDialog({
    component: 'ConfirmDialog',
    componentProps: {
      title: 'Remove dashboard',
      message: `Are you sure you want to remove <b>${dashboard.title}</b>?`,
      html: true,
    },
  }).onOk(async () => {
    const widgetStore = useWidgetStore();
    const dashboardStore = useDashboardStore();
    await dashboardStore.removeDashboard(dashboard);
    await Promise.all(
      widgetStore.widgets
        .filter((widget) => widget.dashboard === dashboard.id)
        .map((widget) => widgetStore.removeWidget(widget)),
    );
  });
}
