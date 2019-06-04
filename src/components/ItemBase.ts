import { Component, Emit, Prop, Vue } from 'vue-property-decorator';

import { DashboardItem } from '@/store/dashboards';
import featureStore from '@/store/features';

@Component
export default class ItemBase extends Vue {
  @Prop({ type: Boolean, default: false })
  public readonly volatile!: boolean;

  @Prop({ type: Object, required: true })
  public readonly widget!: DashboardItem;

  @Emit('update:widget')
  public saveWidget(widget: DashboardItem = this.widget) {
    return widget;
  }

  public get displayName(): string {
    return featureStore.displayNameById(this.widget.feature);
  }

  public saveConfig(config: any) {
    this.saveWidget({ ...this.widget, config });
  }

  public copyWidget() {

  }

  public moveWidget() {

  }

  public deleteWidget() {

  }
}
