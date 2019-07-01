import { Dialog, Notify } from 'quasar';
import UrlSafeString from 'url-safe-string';

import dashboardStore, { Dashboard } from '@/store/dashboards';

import { suggestId } from './functional';

export const changeDashboardId =
  async (oldId: string, newId: string, onIdChanged: (id: string) => void) => {
    const dashboard = dashboardStore.dashboardById(oldId);

    await dashboardStore.createDashboard({ ...dashboard, id: newId });
    await Promise.all(
      dashboardStore.itemValues
        .filter(item => item.dashboard === oldId)
        .map(item => dashboardStore.saveDashboardItem({ ...item, dashboard: newId }))
    );
    await dashboardStore.removeDashboard({ ...dashboard });

    if (dashboardStore.primaryDashboardId === oldId) {
      await dashboardStore.updatePrimaryDashboard(newId);
    }

    Notify.create({
      color: 'positive',
      icon: 'edit',
      message: `Changed dashboard ID '${oldId}' to '${newId}'`,
    });

    onIdChanged(newId);
  };

export const startChangeDashboardId =
  (dashboard: Dashboard, onIdChanged: (id: string) => void = (() => { })) => {
    Dialog.create({
      title: 'Change dashboard ID',
      message: "This will change your dashboard's unique ID",
      dark: true,
      cancel: true,
      prompt: {
        model: dashboard.id,
        type: 'text',
      },
    })
      .onOk(async newId => {
        const oldId = dashboard.id;
        if (!newId || newId === oldId) {
          return;
        }

        if (dashboardStore.dashboardIds.includes(newId)) {
          Notify.create({
            color: 'negative',
            icon: 'error',
            message: `Dashboard ${newId} already exists`,
          });
          return;
        }

        await changeDashboardId(oldId, newId, onIdChanged);
      });
  };

export const startChangeDashboardTitle =
  (dashboard: Dashboard, onIdChanged: (id: string) => void = (() => { })) => {
    Dialog.create({
      title: 'Change dashboard Title',
      message: "Change your dashboard's display name",
      dark: true,
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
        Notify.create({
          color: 'positive',
          icon: 'edit',
          message: `Renamed dashboard '${oldTitle}' to '${newTitle}'`,
        });

        const defaultId = new UrlSafeString().generate(newTitle);
        if (oldId == defaultId) {
          return; // no change
        }
        const suggestedId = suggestId(defaultId, val => !dashboardStore.dashboardIds.includes(val));

        Dialog.create({
          title: 'Update dashboard URL',
          message: `Do you want to change the dashboard ID from '${oldId}' to '${suggestedId}'?`,
          dark: true,
          cancel: true,
        })
          .onOk(() => changeDashboardId(oldId, suggestedId, onIdChanged));
      });
  };

export const startRemoveDashboard =
  (dashboard: Dashboard) => {
    Dialog.create({
      title: 'Remove dashboard',
      message: `Are you sure you want to remove ${dashboard.title}?`,
      dark: true,
      ok: 'Confirm',
      cancel: 'Cancel',
    })
      .onOk(() => dashboardStore.removeDashboard(dashboard));
  };
