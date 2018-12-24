import { dashboardItemById } from '@/store/dashboards/getters';
import { DashboardItem } from '@/store/dashboards/state';
import { widgetSizeById } from '@/store/features/getters';
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    featureId: {
      type: String,
      required: true,
    },
    onCreateItem: {
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
  get typeId(): string {
    return this.$props.featureId;
  }

  get defaultWidgetSize() {
    return widgetSizeById(this.$store, this.typeId);
  }

  itemAlreadyExists(id: string): boolean {
    return !!dashboardItemById(this.$store, id);
  }

  createItem(item: Partial<DashboardItem>) {
    this.$props.onCreateItem(item);
  }

  cancel() {
    this.$props.onCancel();
  }
}
