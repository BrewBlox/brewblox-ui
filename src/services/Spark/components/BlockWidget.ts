import Widget from '@/components/Widget/Widget';
import { get } from 'lodash';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import { Block } from '../state';
import { fetchBlock } from '../store/actions';
import { blockById } from '../store/getters';

@Component
export default class BlockWidget extends Widget {
  /**
   * Use inputMapping to bind sources of values to the inputs used in the component.
   *
   * Object looks like:
   * {
   *    keyInput: {
   *      path: 'propertyName.propertyName.propertyName',
   *      default: 'anything'
   *    }
   * }
   *
   * The purpose is to have a single source of truth, while not updating the source when updating
   * the contents of the inputs.
   *
   * When the source is adjusted, the input value will be updated accordingly.
   *
   * 'path' in keyInput is used as 'path' is used in https://lodash.com/docs/4.17.5#get
   */
  inputMapping: {
    [inputPropName: string]: {
      path: string, // path to value in object
      default?: any, // default value
    },
  } = {};

  inputs: { [inputPropName: string]: any } = {};

  /**
   * Maps all the values found in the source to their respective input properties
   */
  inputsFromSource(): { [key: string]: any } {
    return Object.keys(this.inputMapping)
      .reduce(
        (total, key) => ({
          [key]: get(this, this.inputMapping[key].path) || this.inputMapping[key].default,
          ...total,
        }),
        {},
      );
  }

  get changed(): boolean {
    const state = this.inputsFromSource();
    return Object.keys(state)
      .some(key => state[key] !== this.inputs[key]);
  }

  get serviceId(): string {
    return this.$props.config.serviceId;
  }

  get blockId(): string {
    return this.$props.config.blockId;
  }

  get block(): Block {
    return blockById(this.$store, this.serviceId, this.blockId);
  }

  @Watch('block', { immediate: true, deep: true })
  onBlockUpdate() {
    if (!this.block.isLoading) {
      this.inputs = this.inputsFromSource();
    }
  }

  refreshBlock() {
    fetchBlock(this.$store, this.serviceId, this.block);
  }
}
