import isString from 'lodash/isString';
import UrlSafeString from 'url-safe-string';

import { createDialog } from '@/helpers/dialog';
import notify from '@/helpers/notify';
import { Dashboard, dashboardStore } from '@/store/dashboards';

import { suggestId } from './functional';

type IdChangedCallback = (id: string) => void;

const urlGenerator = new UrlSafeString();

export const dashboardIdRules = (): InputRule[] => [
  v => !!v || 'ID is required',
  v => !dashboardStore.dashboardIds.includes(v) || 'ID must be unique',
  v => v === urlGenerator.generate(v) || 'ID must be URL-safe',
];

export const execDashboardIdChange =
  async (oldId: string, newId: string, onIdChanged: IdChangedCallback): Promise<void> => {
    const dashboard = dashboardStore.dashboardById(oldId);
    if (!dashboard) {
      return;
    }

    await dashboardStore.createDashboard({ ...dashboard, id: newId });
    await Promise.all(
      dashboardStore.widgets
        .filter(item => item.dashboard === oldId)
        .map(item => dashboardStore.saveWidget({ ...item, dashboard: newId }))
    );
    await dashboardStore.removeDashboard({ ...dashboard });

    if (dashboardStore.primaryDashboardId === oldId) {
      await dashboardStore.updatePrimaryDashboard(newId);
    }

    notify.done(`Changed dashboard ID '${oldId}' to '${newId}'`);
    onIdChanged(newId);
  };

export const startChangeDashboardId =
  (dashboard: Dashboard, onIdChanged: IdChangedCallback = (() => { })): void => {
    createDialog({
      component: 'InputDialog',
      value: dashboard.id,
      title: 'Change dashboard ID',
      message: "This will change your dashboard's unique ID",
      rules: dashboardIdRules(),
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
      title: 'Change dashboard Title',
      message: "Change your dashboard's display name",
      cancel: true,
      prompt: {
        model: dashboard.title,
        type: 'text',
      },
    })
      .onOk(async newTitle => {
        const oldId = dashboard.id;
        const oldTitle = dashboard.title;
        if (!newTitle || oldTitle === newTitle) {
          return;
        }

        await dashboardStore.saveDashboard({ ...dashboard, title: newTitle });
        notify.done(`Renamed dashboard '${oldTitle}' to '${newTitle}'`);

        const defaultId = urlGenerator.generate(newTitle);
        if (oldId == defaultId) {
          return; // no change
        }
        const rules = dashboardIdRules();
        const suggestedId = suggestId(defaultId, val => !rules.some(f => isString(f(val))));

        createDialog({
          title: 'Update dashboard URL',
          message: `Do you want to change the dashboard ID from '${oldId}' to '${suggestedId}'?`,
          cancel: true,
        })
          .onOk(() => execDashboardIdChange(oldId, suggestedId, onIdChanged));
      });
  };

export const startRemoveDashboard =
  (dashboard: Dashboard): void => {
    createDialog({
      title: 'Remove dashboard',
      message: `Are you sure you want to remove ${dashboard.title}?`,
      ok: 'Confirm',
      cancel: 'Cancel',
    })
      .onOk(() => dashboardStore.removeDashboard(dashboard));
  };
