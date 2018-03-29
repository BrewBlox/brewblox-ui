import Vue from 'vue';
import Component from 'vue-class-component';

import { isFetching, dashboardById } from '../../store/dashboards/getters';

@Component
class DashboardPage extends Vue {
  get dashboardId(): string {
    return this.$route.params.id;
  }

  get dashboard() {
    console.log(this.dashboardId);

    return dashboardById(this.dashboardId);
  }

  get isFetching() {
    return isFetching();
  }
}

export default DashboardPage;
