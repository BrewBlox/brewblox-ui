import { Dialog, uid } from 'quasar';
import { Component } from 'vue-property-decorator';

import { deepCopy } from '@/helpers/shadow-copy';
import dashboardStore from '@/store/dashboards';
import featureStore from '@/store/features';

import ItemBase from '../ItemBase';

@Component
export default class WidgetBase extends ItemBase {
  public copyWidget() {
    const id = uid();
    Dialog.create({
      title: 'Copy widget',
      message: `To which dashboard do you want to copy widget ${this.widget.title}?`,
      dark: true,
      options: {
        type: 'radio',
        model: null,
        items: dashboardStore.dashboardValues
          .map(dashboard => ({ label: dashboard.title, value: dashboard.id })),
      },
      cancel: true,
    })
      .onOk((dashboard: string) => {
        if (!dashboard) {
          return;
        }
        dashboardStore.appendDashboardItem({ ...deepCopy(this.widget), id, dashboard, pinnedPosition: null });
        this.$q.notify({
          color: 'positive',
          icon: 'file_copy',
          message: `Copied ${this.widget.title} to ${dashboardStore.dashboardById(dashboard).title}`,
        });
      });
  }

  public moveWidget() {
    Dialog.create({
      title: 'Move widget',
      message: `To which dashboard do you want to move widget ${this.widget.title}?`,
      dark: true,
      options: {
        type: 'radio',
        model: null,
        items: dashboardStore.dashboardValues
          .filter(dashboard => dashboard.id !== this.widget.dashboard)
          .map(dashboard => ({ label: dashboard.title, value: dashboard.id })),
      },
      cancel: true,
    })
      .onOk((dashboard: string) =>
        dashboard && this.saveWidget({ ...this.widget, dashboard, pinnedPosition: null }));
  }

  public deleteWidget() {
    const deleteItem = () => dashboardStore.removeDashboardItem(this.widget);

    // Quasar dialog can't handle objects as value - they will be returned as null
    // As workaround, we use array index as value, and add the "action" key to each option
    const opts = [
      {
        label: 'Remove widget from this dashboard',
        action: deleteItem,
      },
      ...featureStore.deletersById(this.widget.feature)
        .map(del => ({ label: del.description, action: del.action })),
    ].map((opt, idx) => ({ ...opt, value: idx }));

    Dialog.create({
      title: 'Delete widget',
      message: `How do you want to delete widget ${this.widget.title}?`,
      dark: true,
      options: {
        type: 'checkbox',
        model: [0], // pre-check the default action
        items: opts,
      },
      cancel: true,
    })
      .onOk((selected: number[]) => {
        selected.forEach(idx => opts[idx].action(this.widget.config));
      });
  }
}
