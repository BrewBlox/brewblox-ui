import { Dialog, uid } from 'quasar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { deepCopy } from '@/helpers/units/parseObject';
import { DashboardItem, dashboardStore } from '@/store/dashboards';
import { featureStore } from '@/store/features';

export interface Crud {
  widget: DashboardItem;
  isStoreWidget: boolean;
  saveWidget(widget: DashboardItem): unknown | Promise<unknown>;
  closeDialog(): void;
}

@Component
export default class CrudComponent extends Vue {
  @Prop({ type: Object, required: true })
  public readonly crud!: Crud;

  public get widget(): DashboardItem {
    return this.crud.widget;
  }

  public get isStoreWidget(): boolean {
    return this.crud.isStoreWidget;
  }

  public get displayName(): string {
    return featureStore.displayNameById(this.widget.feature);
  }

  public closeDialog() {
    this.crud.closeDialog();
  }

  public saveWidget(widget: DashboardItem = this.widget) {
    this.crud.saveWidget(widget);
  }

  public saveConfig(config: any = this.widget.config) {
    this.saveWidget({ ...this.widget, config });
  }

  public startChangeWidgetTitle() {
    let widgetTitle = this.widget.title;
    Dialog.create({
      title: 'Change Widget name',
      message: `Choose a new name for '${widgetTitle}'`,
      dark: true,
      cancel: true,
      prompt: {
        model: widgetTitle,
        type: 'text',
      },
    })
      .onOk(title => this.saveWidget({ ...this.widget, title }));
  }

  public startCopyWidget() {
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

  public startMoveWidget() {
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

  public startRemoveWidget() {
    const deleteItem = async () => {
      await dashboardStore.removeDashboardItem(this.widget);
      this.closeDialog();
    };

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
