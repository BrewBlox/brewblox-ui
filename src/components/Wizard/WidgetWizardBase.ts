import isString from 'lodash/isString';
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
  },
})
export default class WidgetWizardBase extends Vue {
  protected $q: any;

  protected widgetId: string = '';

  protected get typeId(): string {
    return this.$props.featureId;
  }

  protected get defaultWidgetSize(): { cols: number; rows: number } {
    return widgetSizeById(this.$store, this.typeId);
  }

  protected get widgetIdRules(): InputRule[] {
    return [
      v => !!v || 'Name must not be empty',
      v => !this.itemAlreadyExists(v) || 'Name must be unique',
    ];
  }

  protected get widgetIdOk(): boolean {
    return !this.widgetIdRules.some(rule => isString(rule(this.widgetId)));
  }

  protected itemAlreadyExists(id: string): boolean {
    return !!dashboardItemById(this.$store, id);
  }

  protected changeWidgetId(newId: string): void {
    const errors = this.widgetIdRules
      .map(rule => rule(newId))
      .filter(isString);

    if (errors.length > 0) {
      this.$q.notify({
        message: errors.join(', '),
        color: 'negative',
        icon: 'error',
      });
      return;
    }
    this.widgetId = newId;
  }

  protected async createItem(item: DashboardItem): Promise<void> {
    try {
      await appendDashboardItem(this.$store, item);
      this.$q.notify({
        icon: 'mdi-check-all',
        color: 'positive',
        message: `Added ${displayNameById(this.$store, item.feature)} '${item.id}'`,
      });
    } catch (e) {
      this.$q.notify({
        icon: 'error',
        color: 'negative',
        message: `Failed to add widget: ${e.toString()}`,
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
