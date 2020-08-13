import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { Widget } from '@/store/dashboards';
import { Crud, featureStore, WidgetContext, WidgetMode } from '@/store/features';

export interface WidgetProps {
  initialCrud: Crud;
  context: WidgetContext;
}

@Component
export default class WidgetBase<ConfigT = any> extends Vue {
  public activeDialog: any = null;
  public activeMode: WidgetMode | null = null;

  @Prop({ type: Object, required: true })
  public readonly initialCrud!: Crud<ConfigT>;

  @Prop({ type: Object, required: true })
  public readonly context!: WidgetContext;

  public get crud(): Crud<ConfigT> {
    // Allows overriding by child classes that use an extended Crud
    return this.initialCrud;
  }

  public get mode(): WidgetMode {
    return this.activeMode ?? this.context.mode;
  }

  public set mode(val: WidgetMode) {
    this.activeMode = val;
  }

  public get widget(): Widget<ConfigT> {
    return this.crud.widget;
  }

  public get config(): ConfigT {
    return this.widget.config;
  }

  public get isStoreWidget(): boolean {
    return this.crud.isStoreWidget;
  }

  public get featureTitle(): string {
    return featureStore.widgetTitle(this.widget.feature) ?? this.widget.feature;
  }

  public get inDialog(): boolean {
    return this.context.container === 'Dialog';
  }

  public get toolbarComponent(): string {
    return this.inDialog
      ? 'WidgetDialogToolbar'
      : 'WidgetToolbar';
  }

  public async saveWidget(widget: Widget = this.crud.widget): Promise<void> {
    await this.crud.saveWidget(widget);
  }

  public async saveConfig(config: ConfigT = this.config): Promise<void> {
    await this.saveWidget({ ...this.widget, config });
  }

  public showDialog(args: Mapped<any> = {}): void {
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
