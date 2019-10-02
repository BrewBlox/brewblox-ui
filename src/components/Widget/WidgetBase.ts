import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { DashboardItem } from '@/store/dashboards';
import { featureStore, WidgetContext } from '@/store/features';

import { Crud } from './CrudComponent';

@Component
export default class WidgetBase extends Vue {
  public activeDialog: any = null;

  @Prop({ type: Object, required: true })
  public readonly initialCrud!: Crud;

  @Prop({ type: Object, required: true })
  public readonly context!: WidgetContext;

  public get crud(): Crud {
    // Allows overriding by child classes that use an extended Crud
    return this.initialCrud;
  }

  public get widget(): DashboardItem {
    return this.crud.widget;
  }

  public get isStoreWidget(): boolean {
    return this.crud.isStoreWidget;
  }

  public get displayName(): string {
    return featureStore.displayNameById(this.widget.feature);
  }

  public saveWidget(widget: DashboardItem = this.crud.widget): void {
    this.crud.saveWidget(widget);
  }

  public saveConfig(config: any): void {
    this.saveWidget({ ...this.widget, config });
  }

  public showForm(args: Record<string, any> = {}): void {
    this.activeDialog = createDialog({
      component: 'WidgetDialog',
      getCrud: () => ({ ...this.crud, closeDialog: this.closeDialog }),
      ...args,
    });
    return this.activeDialog;
  }

  public closeDialog(): void {
    if (this.activeDialog) {
      this.activeDialog.hide();
      this.activeDialog = null;
    }
  }
}
