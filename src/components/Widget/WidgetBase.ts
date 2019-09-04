import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { DashboardItem } from '@/store/dashboards';
import { featureStore } from '@/store/features';

import { Crud } from './CrudComponent';

@Component
export default class WidgetBase extends Vue {
  public activeDialog: any = null;

  @Prop({ type: Boolean, default: false })
  public readonly volatile!: boolean;

  @Prop({ type: Object, required: true })
  public readonly widget!: DashboardItem;

  @Emit('update:widget')
  public saveWidget(widget: DashboardItem = this.widget): DashboardItem {
    return widget;
  }

  public saveConfig(config: any): void {
    this.saveWidget({ ...this.widget, config });
  }

  public get displayName(): string {
    return featureStore.displayNameById(this.widget.feature);
  }

  public get crud(): Crud {
    return {
      widget: this.widget,
      isStoreWidget: !this.volatile,
      saveWidget: this.saveWidget,
      closeDialog: this.closeDialog,
    };
  }

  public showForm(args: Record<string, any> = {}): void {
    this.activeDialog = createDialog({
      component: 'FormDialog',
      getCrud: () => this.crud,
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
