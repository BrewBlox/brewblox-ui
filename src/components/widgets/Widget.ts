import Vue from 'vue';
import Component from 'vue-class-component';

import { dashboardItemById } from '../../store/dashboards/getters';

@Component({
  props: {
    id: {
      type: String,
      default: '',
    },
  },
})
export default class Widget extends Vue {
  get options() {
    return dashboardItemById(this.$props.id).options;
  }
}
