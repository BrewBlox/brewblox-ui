import Vue from 'vue';
import Component from 'vue-class-component';

import { getById } from '../../../store/blocks/SetPointSimple/getters';

@Component({
  props: {
    id: {
      default: '',
      type: String,
    },
  },
})
export default class SetPointSimple extends Vue {
  get blockData() {
    return getById(this.$props.id);
  }

  get settings() {
    return this.blockData.settings;
  }
}
