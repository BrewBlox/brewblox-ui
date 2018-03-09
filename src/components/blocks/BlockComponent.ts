import Vue from 'vue';
import Component from 'vue-class-component';

import { Block } from '../../store/blocks/state';

@Component({
  props: {
    id: {
      default: '',
      type: String,
    },
  },
})
export default class BlockComponent extends Vue {
  get blockData(): Block {
    throw new Error('Provide own blockData');
  }

  get loading(): boolean {
    return !!this.blockData.isLoading;
  }
}
