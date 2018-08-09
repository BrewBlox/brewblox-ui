import Component from 'vue-class-component';

import BlockComponent from '../BlockComponent';

import { getById } from '@/store/blocks/SetPointSimple/getters';
import { persist } from '@/store/blocks/SetPointSimple/actions';

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
export default class SetPointSimple extends BlockComponent {
  valueInput = 0;

  get blockData() {
    return getById(this.$store, this.$props.id);
  }

  get setting() {
    return this.blockData.setting;
  }

  get changed() {
    return this.setting !== this.valueInput;
  }

  mounted() {
    this.valueInput = this.setting;
  }

  save() {
    persist(this.$store, {
      id: this.blockData.id,
      profiles: this.blockData.profiles,
      serviceId: this.blockData.serviceId,
      setting: this.valueInput,
    });
  }
}
