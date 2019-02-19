import { dashboardItemById } from '@/store/dashboards/getters';
import { DashboardItem } from '@/store/dashboards/state';
import { widgetSizeById } from '@/store/features/getters';
import Vue from 'vue';
import Component from 'vue-class-component';

export interface NavAction {
  label: string;
  click: Function;
  enabled: Function;
}

@Component({
  props: {
    featureId: {
      type: String,
      required: true,
    },
    onCreate: {
      type: Function,
      required: true,
    },
    onCancel: {
      type: Function,
      required: true,
    },
  },
})
export default class ExampleFeatureWizard extends Vue {
  protected get typeId(): string {
    return this.$props.featureId;
  }

  protected get defaultWidgetSize(): { cols: number; rows: number } {
    return widgetSizeById(this.$store, this.typeId);
  }

  protected itemAlreadyExists(id: string): boolean {
    return !!dashboardItemById(this.$store, id);
  }

  protected createItem(item: Partial<DashboardItem>): void {
    this.$props.onCreate(item);
  }

  protected cancel(): void {
    this.$props.onCancel();
  }
}
