import Vue from 'vue';
import Component from 'vue-class-component';

import { allDashboards, isFetching } from '../store/dashboards/getters';

@Component
class LayoutDefault extends Vue {
  leftDrawerOpen: boolean = false;

  get dashboards() {
    return allDashboards();
  }

  get isFetching() {
    return isFetching();
  }

  toggleDrawer() {
    this.leftDrawerOpen = !this.leftDrawerOpen;
  }
}

export default LayoutDefault;
