import { uid } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import notify from '@/helpers/notify';
import { dashboardStore, Widget } from '@/store/dashboards';
import { featureStore } from '@/store/features';

import WizardBase from './WizardBase';

@Component
export default class WidgetWizardBase<ConfigT = any> extends WizardBase {
  protected widgetId: string = uid();
  protected widgetTitle = '';

  @Prop({ type: String, required: true })
  public readonly featureId!: string;

  protected get featureTitle(): string {
    return featureStore.widgetTitle(this.featureId);
  }

  protected get defaultWidgetSize(): GridSize {
    return featureStore.widgetSize(this.featureId);
  }

  protected async makeWidget(widget: Widget<ConfigT>): Promise<void> {
    await dashboardStore.appendWidget(widget)
      .then(() => notify.done(`Created ${featureStore.widgetTitle(widget.feature)} widget '${widget.title}'`))
      .catch(e => notify.error(`Failed to create widget: ${e.toString()}`))
      .finally(this.close);
  }
}
