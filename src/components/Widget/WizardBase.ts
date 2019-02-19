import { dashboardItemById } from '@/store/dashboards/getters';
import { DashboardItem } from '@/store/dashboards/state';
import { widgetSizeById } from '@/store/features/getters';
import Vue from 'vue';
import Component from 'vue-class-component';
import { appendDashboardItem } from '@/store/dashboards/actions';
import { displayNameById } from '@/store/providers/getters';

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
    dashboardId: {
      type: String,
      required: false,
    },
    onCancel: {
      type: Function,
      required: true,
    },
  },
})
export default class WizardBase extends Vue {
  protected $q: any;

  protected get typeId(): string {
    return this.$props.featureId;
  }

  protected get defaultWidgetSize(): { cols: number; rows: number } {
    return widgetSizeById(this.$store, this.typeId);
  }

  protected itemAlreadyExists(id: string): boolean {
    return !!dashboardItemById(this.$store, id);
  }

  protected async createItem(item: DashboardItem): Promise<void> {
    try {
      await appendDashboardItem(this.$store, item);
      this.$q.notify({
        type: 'positive',
        message: `Added ${displayNameById(this.$store, item.feature)} "${item.id}"`,
      });
    } catch (e) {
      this.$q.notify(`Failed to add widget: ${e.toString()}`);
    }
    this.$props.onCreate(item);
  }

  protected cancel(): void {
    this.$props.onCancel();
  }
}
