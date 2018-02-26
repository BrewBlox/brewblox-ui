import Vue from 'vue';
import Component from 'vue-class-component';

import { getById } from '../../../store/blocks/SensorSetPointPair/getters';

@Component({
  props: {
    id: {
      default: '',
      type: String,
    },
  },
})
export default class SensorSetPointPair extends Vue {
  get blockData() {
    return getById(this.$props.id);
  }

  get links() {
    return this.blockData.links;
  }
}
