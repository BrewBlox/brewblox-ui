import Vue from 'vue';
import Component from 'vue-class-component';

import byOrder from '@/core/byOrder';

import { allDashboards, isFetching } from '@/store/dashboards/getters';
import { addNewDashboard } from '@/store/dashboards/actions';

@Component
class LayoutDefault extends Vue {
  leftDrawerOpen: boolean = false;
  dashboardEditing: boolean = false;
  $q: any;

  get dashboards() {
    return [...allDashboards(this.$store)].sort(byOrder);
  }

  get isFetching() {
    return isFetching(this.$store);
  }

  toggleDrawer() {
    this.leftDrawerOpen = !this.leftDrawerOpen;
  }

  toggleDashboardEditing() {
    this.dashboardEditing = !this.dashboardEditing;
  }

  createDashboard() {
    this.$q.dialog({
      title: 'Add dashboard',
      message: 'Enter name of the dashboard',
      cancel: true,
      prompt: {
        model: '',
      },
    })
      .then((dashboardName: string) => {
        addNewDashboard(this.$store, dashboardName);
      })
      .catch(() => {});
  }
}

export default LayoutDefault;
