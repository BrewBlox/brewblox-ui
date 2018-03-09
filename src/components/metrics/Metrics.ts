import Vue from 'vue';
import Component from 'vue-class-component';

import { getMetricsById } from '../../store/blocks/OneWireTempSensor/getters';

@Component({
  props: {
    id: {
      default: '',
      type: String,
    },
  },
})
export default class Metrics extends Vue {
  get metrics() {
    return getMetricsById(this.$props.id);
  }
};
