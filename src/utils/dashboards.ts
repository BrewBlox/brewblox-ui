import UrlSafeString from 'url-safe-string';

import { Dashboard, dashboardStore } from '@/store/dashboards';
import { systemStore } from '@/store/system';
import { widgetStore } from '@/store/widgets';
import { createDialog } from '@/utils/dialog';
import notify from '@/utils/notify';

import { ruleValidator, suggestId } from './functional';

type IdChangedCallback = (id: string) => void;

const urlGenerator = new UrlSafeString();

export const dashboardIdRules = (): InputRule[] => [
  v => !!v || 'Value is required',
  v => !dashboardStore.dashboardIds.includes(v) || 'Value must be unique',
  v => v === urlGenerator.generate(v) || 'Value must be URL-safe',
];

export const execDashboardIdChange =
  async (oldId: string, newId: string, onIdChanged: IdChangedCallback): Promise<void> => {
    const dashboard = dashboardStore.dashboardById(oldId);
    if (!dashboard) {
      return;
    }

    await dashboardStore.createDashboard({ ...dashboard, id: newId });
    await Promise.all(
      widgetStore.widgets
        .filter(item => item.dashboard === oldId)
        .map(item => widgetStore.saveWidget({ ...item, dashboard: newId })),
    );
    await dashboardStore.removeDashboard({ ...dashboard });

    if (systemStore.config.homePage === `/dashboard/${oldId}`) {
      await systemStore.saveConfig({ homePage: `/dashboard/${newId}` });
    }

    notify.done(`Changed dashboard URL to <b>${newId}</b>`);
    onIdChanged(newId);
  };

export const startChangeDashboardId =
  (dashboard: Dashboard, onIdChanged: IdChangedCallback = (() => { })): void => {
    createDialog({
      component: 'InputDialog',
      componentProps: {
        modelValue: dashboard.id,
        title: 'Change dashboard URL',
        message: 'The dashboard URL is used as unique identifier.',
        rules: dashboardIdRules(),
      },
    })
      .onOk(async (newId: string) => {
        const oldId = dashboard.id;
        if (newId !== oldId) {
          await execDashboardIdChange(oldId, newId, onIdChanged);
        }
      });
  };

export const startChangeDashboardTitle =
  (dashboard: Dashboard, onIdChanged: IdChangedCallback = (() => { })): void => {
    createDialog({
      component: 'InputDialog',
      componentProps: {
        title: 'Rename dashboard',
        message: 'This changes the dashboard display name, not its unique identifier.',
        modelValue: dashboard.title,
      },
    })
      .onOk(async (newTitle: string) => {
        const oldId = dashboard.id;
        const oldTitle = dashboard.title;
        if (!newTitle || oldTitle === newTitle) {
          return;
        }

        await dashboardStore.saveDashboard({ ...dashboard, title: newTitle });
        notify.done(`Renamed dashboard to <b>${newTitle}</b>`);

        const defaultId = urlGenerator.generate(newTitle);
        if (oldId === defaultId) {
          return; // no change
        }
        const rules = dashboardIdRules();
        const suggestedId = suggestId(defaultId, ruleValidator(rules));

        createDialog({
          component: 'ConfirmDialog',
          componentProps: {
            title: 'Update dashboard URL',
            message: `Do you want to change the dashboard URL from <b>${oldId}</b> to <b>${suggestedId}</b>?`,
            html: true,
            ok: 'Yes',
            cancel: 'No',
          },
        })
          .onOk(() => execDashboardIdChange(oldId, suggestedId, onIdChanged));
      });
  };

export const startRemoveDashboard =
  (dashboard: Dashboard): void => {
    createDialog({
      component: 'ConfirmDialog',
      componentProps: {
        title: 'Remove dashboard',
        message: `Are you sure you want to remove <b>${dashboard.title}</b>?`,
        html: true,
      },
    })
      .onOk(async () => {
        await dashboardStore.removeDashboard(dashboard);
        await Promise.all(
          widgetStore.widgets
            .filter(widget => widget.dashboard === dashboard.id)
            .map(widget => widgetStore.removeWidget(widget)));
      });
  };
