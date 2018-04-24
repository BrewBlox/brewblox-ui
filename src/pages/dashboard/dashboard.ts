import Vue from 'vue';
import Component from 'vue-class-component';

import GridContainer from '@/components/grid/grid-container.vue';

import byOrder from '@/core/byOrder';

import { isFetching, dashboardById, dashboardItemById } from '@/store/dashboards/getters';
import {
  updateDashboardItemOrder,
  updateDashboardItemSize,
} from '@/store/dashboards/actions';

import { addComponentByType } from './widgets';

interface VueOrdered extends Vue {
  id: string;
}

@Component({
  components: {
    GridContainer,
  },
})
class DashboardPage extends Vue {
  editable: boolean = false;
  modalOpen: boolean = false;

  get dashboardId(): string {
    return this.$route.params.id;
  }

  get dashboard() {
    return dashboardById(this.$store, this.dashboardId);
  }

  get items() {
    return [
      ...this.dashboard.items
        .map(id => dashboardItemById(this.$store, id))
        .map(addComponentByType),
    ].sort(byOrder);
  }

  get isFetching() {
    return isFetching(this.$store);
  }

  toggleEditable() {
    this.editable = !this.editable;
  }

  onOpenAddWidget() {
    this.modalOpen = true;
  }

  async onChangeOrder(order: VueOrdered[]) {
    const newOrder = order.map(item => item.id);

    try {
      await updateDashboardItemOrder(this.$store, newOrder);
    } catch (e) {
      throw e;
    }
  }

  onChangeSize(id: string, cols: number, rows: number) {
    updateDashboardItemSize(this.$store, { id, cols, rows });
  }
}

export default DashboardPage;
