import Component from 'vue-class-component';

import BlockComponent from '../BlockComponent';

import { getById } from '@/store/blocks/SetPointSimple/getters';
import { persist } from '@/store/blocks/SetPointSimple/actions';

@Component({
  props: {
    id: {
      default: '',
      type: String,
    },
  },
})
export default class SetPointSimple extends BlockComponent {
  valueInput = 0;

  get blockData() {
    return getById(this.$store, this.$props.id);
  }

  get settings() {
    return this.blockData.settings;
  }

  get changed() {
    return this.settings.value !== this.valueInput;
  }

  mounted() {
    this.valueInput = this.settings.value;
  }

  save() {
    persist(this.$store, {
      id: this.$props.id,
      settings: {
        value: this.valueInput,
      },
    });
  }
}
