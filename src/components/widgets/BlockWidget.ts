import { get } from 'lodash';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';

import { blockById } from '@/store/blocks/getters';
import { Block } from '@/store/blocks/state';

import Widget from './Widget';

@Component
class BlockWidget extends Widget {
  inputMapping: {
    [inputPropName: string]: {
      path: string,   // path to value in object
      default?: any,   // default value
    },
  } = {};

  inputs: { [inputPropName: string]: any } = {};

  inputsFromState(): { [key: string]: any } {
    return Object.keys(this.inputMapping)
      .reduce(
        (total, key) => {
          return {
            [key]: get(this, this.inputMapping[key].path) || this.inputMapping[key].default,
            ...total,
          };
        },
        {},
      );
  }

  get changed() {
    const state = this.inputsFromState();

    return Object.keys(state).some(key => state[key] !== this.inputs[key]);
  }

  get block(): Block {
    return blockById(this.$store, this.options.block);
  }

  @Watch('block', { immediate: true, deep: true })
  onBlockUpdate() {
    this.inputs = this.inputsFromState();
  }
}

export default BlockWidget;
