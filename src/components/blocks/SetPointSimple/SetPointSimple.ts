import Vue from 'vue';
import Component from 'vue-class-component';

import { getById } from '../../../store/blocks/SetPointSimple/getters';
import { persist } from '../../../store/blocks/SetPointSimple/actions';

@Component({
  props: {
    id: {
      default: '',
      type: String,
    },
  },
})
export default class SetPointSimple extends Vue {
  valueInput = 0;

  get blockData() {
    return getById(this.$props.id);
  }

  get settings() {
    return this.blockData.settings;
  }

  get loading() {
    return !!this.blockData.isLoading;
  }

  get changed() {
    return this.settings.value !== this.valueInput;
  }

  mounted() {
    this.valueInput = this.settings.value;
  }

  update() {
    persist({
      id: this.$props.id,
      settings: {
        value: this.valueInput,
      },
    });
  }
}
