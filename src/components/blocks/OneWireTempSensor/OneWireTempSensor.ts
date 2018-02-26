import Vue from 'vue';
import Component from 'vue-class-component';

import { getById } from '../../../store/blocks/OneWireTempSensor/getters';

@Component({
  props: {
    id: {
      default: '',
      type: String,
    },
  },
})
export default class OneWireTempSensor extends Vue {
  get blockData() {
    return getById(this.$props.id);
  }

  get settings() {
    return this.blockData.settings;
  }

  get state() {
    return this.blockData.state;
  }
}
