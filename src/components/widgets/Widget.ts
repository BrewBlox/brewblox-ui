import Vue from 'vue';
import Component from 'vue-class-component';

import { dashboardItemById } from '../../store/dashboards/getters';

@Component({
  props: {
    id: {
      type: String,
      default: '',
    },
    cols: {
      type: Number,
      default: 1,
    },
    rows: {
      type: Number,
      default: 1,
    },
  },
})
export default class Widget extends Vue {
  get dashboardItem() {
    return dashboardItemById(this.$store, this.$props.id);
  }

  get options() {
    return this.dashboardItem.options;
  }
}
