import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

import { DashboardItem } from '@/store/dashboards';
import featureStore from '@/store/features';

import { Crud } from './CrudComponent';

@Component
export default class WidgetBase extends Vue {

  @Prop({ type: Boolean, default: false })
  public readonly volatile!: boolean;

  @Prop({ type: Object, required: true })
  public readonly widget!: DashboardItem;

  @Emit('update:widget')
  public saveWidget(widget: DashboardItem = this.widget) {
    return widget;
  }

  public saveConfig(config: any) {
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
    };
  }
}
