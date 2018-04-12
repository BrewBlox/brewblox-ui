import { get } from 'lodash';
import Component from 'vue-class-component';

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

  inputsFromState() {
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

  mounted() {
    this.inputs = this.inputsFromState();
  }

  get changed() {
    return false;
  }

  get block(): Block {
    return blockById(this.$store, this.options.block);
  }
}

export default BlockWidget;
