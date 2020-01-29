import { uid } from 'quasar';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

import notify from '@/helpers/notify';
import { dashboardStore, Widget } from '@/store/dashboards';
import { featureStore } from '@/store/features';

export interface NavAction {
  label: string;
  click: Function;
  enabled: Function;
}

@Component
export default class WidgetWizardBase<ConfigT = any> extends Vue {
  protected widgetId: string = uid();
  protected widgetTitle = '';

  @Prop({ type: String, required: true })
  public readonly featureId!: string;

  @Prop({ type: String, required: false })
  public readonly dashboardId!: string;

  @Emit()
  public back(): void { }

  @Emit()
  public close(): void { }

  protected get typeId(): string {
    return this.featureId;
  }

  protected get typeDisplayName(): string {
    return featureStore.displayName(this.typeId);
  }

  protected get defaultWidgetSize(): { cols: number; rows: number } {
    return featureStore.widgetSize(this.typeId);
  }

  protected async createItem(item: Widget<ConfigT>): Promise<void> {
    await dashboardStore.appendWidget(item)
      .then(() => notify.done(`Created ${featureStore.displayName(item.feature)} '${item.title}'`))
      .catch(e => notify.error(`Failed to create widget: ${e.toString()}`))
      .finally(this.close);
  }
}
