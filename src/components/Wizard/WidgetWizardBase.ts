import { DashboardItem } from '@/store/dashboards/state';
import { widgetSizeById } from '@/store/features/getters';
import Vue from 'vue';
import Component from 'vue-class-component';
import dashboardStore from '@/store/dashboards';
import { displayNameById } from '@/store/features/getters';
import { uid } from 'quasar';

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
  },
})
export default class WidgetWizardBase extends Vue {
  protected $q: any;

  protected widgetId: string = uid();
  protected widgetTitle: string = '';

  protected get typeId(): string {
    return this.$props.featureId;
  }

  protected get typeDisplayName(): string {
    return displayNameById(this.$store, this.typeId);
  }

  protected get defaultWidgetSize(): { cols: number; rows: number } {
    return widgetSizeById(this.$store, this.typeId);
  }

  protected async createItem(item: DashboardItem): Promise<void> {
    try {
      await dashboardStore.appendDashboardItem(item);
      this.$q.notify({
        icon: 'mdi-check-all',
        color: 'positive',
        message: `Created ${displayNameById(this.$store, item.feature)} '${item.title}'`,
      });
    } catch (e) {
      this.$q.notify({
        icon: 'error',
        color: 'negative',
        message: `Failed to create widget: ${e.toString()}`,
      });
    }
    this.$emit('close');
  }

  protected back(): void {
    this.$emit('back');
  }

  protected close(): void {
    this.$emit('close');
  }
}
