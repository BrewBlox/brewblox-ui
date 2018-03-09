import Vue from 'vue';

import { Block } from '../../store/blocks/state';

export default abstract class BlockComponent extends Vue {
  abstract get blockData(): Block;

  get loading(): boolean {
    return Boolean(this.blockData.isLoading);
  }
}
