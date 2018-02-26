import Vue from 'vue';
import Component from 'vue-class-component';

import { getById } from '../../../store/blocks/SetPointSimple/getters';

/* eslint-disable indent */
@Component({
  props: {
    id: {
      default: '',
      type: String,
    },
  },
})
/* eslint-enable */
export default class SetPointSimple extends Vue {
  get blockData() {
    return getById(this.$props.id);
  }

  get settings() {
    return this.blockData.settings;
  }
}
