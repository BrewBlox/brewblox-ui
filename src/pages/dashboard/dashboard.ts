import Vue from 'vue';
import Component from 'vue-class-component';

import GridContainer from '../../components/grid/grid-container.vue';

import { isFetching, dashboardById, dashboardItemById } from '../../store/dashboards/getters';

@Component({
  components: {
    GridContainer,
  },
})
class DashboardPage extends Vue {
  get dashboardId(): string {
    return this.$route.params.id;
  }

  get dashboard() {
    return dashboardById(this.dashboardId);
  }

  get items() {
    return this.dashboard.items.map(dashboardItemById);
  }

  get isFetching() {
    return isFetching();
  }
}

export default DashboardPage;
