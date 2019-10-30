import { uid } from 'quasar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { deepCopy } from '@/helpers/units/parseObject';
import { dashboardStore, PersistentWidget } from '@/store/dashboards';
import { Crud, featureStore, WidgetMode } from '@/store/features';

export interface DialogOpts {
  widgetProps?: any;
  mode?: WidgetMode;
  listeners?: Mapped<Function>;
}

@Component
export default class CrudComponent<ConfigT = any> extends Vue {
  private activeDialog: any = null;

  @Prop({ type: Object, required: true })
  public readonly crud!: Crud;

  public get widget(): PersistentWidget<ConfigT> {
    return this.crud.widget;
  }

  public get isStoreWidget(): boolean {
    return this.crud.isStoreWidget;
  }

  public get displayName(): string {
    return featureStore.displayName(this.widget.feature);
  }

  public showDialog(opts: DialogOpts = {}): void {
    const { widgetProps, mode, listeners } = opts;
    this.activeDialog = createDialog({
      parent: this,
      component: 'WidgetDialog',
      getCrud: () => ({ ...this.crud, closeDialog: this.closeDialog }),
      getProps: () => widgetProps,
      mode,
      listeners,
    });
  }

  public closeDialog(): void {
    if (this.activeDialog) {
      this.activeDialog.hide();
      this.activeDialog = null;
    }
    this.crud.closeDialog();
  }

  public async saveWidget(widget: PersistentWidget = this.widget): Promise<void> {
    await this.crud.saveWidget(widget);
  }

  public async saveConfig(config: ConfigT = this.widget.config): Promise<void> {
    await this.saveWidget({ ...this.widget, config });
  }

  public startChangeWidgetTitle(): void {
    const widgetTitle = this.widget.title;
    createDialog({
      parent: this,
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

  public startCopyWidget(): void {
    const id = uid();
    createDialog({
      parent: this,
      title: 'Copy widget',
      message: `To which dashboard do you want to copy widget ${this.widget.title}?`,
      dark: true,
      options: {
        type: 'radio',
        model: undefined,
        items: dashboardStore.dashboardValues
          .map(dashboard => ({ label: dashboard.title, value: dashboard.id })),
      },
      cancel: true,
    })
      .onOk((dashboard: string) => {
        if (!dashboard) {
          return;
        }
        dashboardStore.appendPersistentWidget({ ...deepCopy(this.widget), id, dashboard, pinnedPosition: null });
        this.$q.notify({
          color: 'positive',
          icon: 'file_copy',
          message: `Copied ${this.widget.title} to ${dashboardStore.dashboardById(dashboard).title}`,
        });
      });
  }

  public startMoveWidget(): void {
    createDialog({
      parent: this,
      title: 'Move widget',
      message: `To which dashboard do you want to move widget ${this.widget.title}?`,
      dark: true,
      options: {
        type: 'radio',
        model: undefined,
        items: dashboardStore.dashboardValues
          .filter(dashboard => dashboard.id !== this.widget.dashboard)
          .map(dashboard => ({ label: dashboard.title, value: dashboard.id })),
      },
      cancel: true,
    })
      .onOk((dashboard: string) =>
        dashboard && this.saveWidget({ ...this.widget, dashboard, pinnedPosition: null }));
  }

  public startRemoveWidget(): void {
    const deleteItem = async (): Promise<void> => {
      await dashboardStore.removePersistentWidget(this.widget);
      this.closeDialog();
    };

    // Quasar dialog can't handle objects as value - they will be returned as null
    // As workaround, we use array index as value, and add the "action" key to each option
    const opts = [
      {
        label: 'Remove widget from this dashboard',
        action: deleteItem,
      },
      ...featureStore.deleters(this.widget.feature)
        .map(del => ({ label: del.description, action: del.action })),
    ].map((opt, idx) => ({ ...opt, value: idx }));

    createDialog({
      parent: this,
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
        selected.forEach(idx => opts[idx].action(this.crud));
      });
  }
}
