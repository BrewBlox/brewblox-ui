import Vue from 'vue';
import Component from 'vue-class-component';

import GridContainer from '../../components/grid/grid-container.vue';

import byOrder from '../../core/byOrder';

import { isFetching, dashboardById, dashboardItemById } from '../../store/dashboards/getters';
import { changeDashboardItemOrder } from '../../store/dashboards/actions';


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
    return dashboardById(this.dashboardId);
  }

  get items() {
    return [...this.dashboard.items.map(dashboardItemById)].sort(byOrder);
  }

  get isFetching() {
    return isFetching();
  }

  toggleEditable() {
    this.editable = !this.editable;
  }

  onOpenAddBlock() {
    this.modalOpen = true;
  }

  async onChangeOrder(order: VueOrdered[]) {
    const newOrder = order.map(item => item.id);

    try {
      await changeDashboardItemOrder(newOrder);
    } catch (e) {
      throw e;
    }
  }

  onChangeSize(id: String, cols: number, rows: number) {
    // this.$set(
    //   this,
    //   'items',
    //   this.items.map((item) => {
    //     if (item.id === id) {
    //       return { id, cols, rows };
    //     }
    //
    //     return item;
    //   }),
    // );
  }

  addBlock(cols: number, rows: number) {
    // this.$set(
    //   this,
    //   'items',
    //   [
    //     ...this.items,
    //     { id: this.items.length + 1, cols, rows },
    //   ],
    // );

    this.editable = true;
    this.modalOpen = false;
  }
}

export default DashboardPage;
