import { uid } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import { featureStore } from '@/store/features';

import WizardBase from './WizardBase';

@Component
export default class WidgetWizardBase extends WizardBase {
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
}
