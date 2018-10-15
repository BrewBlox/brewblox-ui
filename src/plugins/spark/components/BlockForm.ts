import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import { Block } from '@/plugins/spark/state';
import { toShadow, fromShadow, ShadowMapping, deepCopy } from '@/helpers/shadow-copy';
import { profileNames as serviceProfiles } from '@/plugins/spark/store/getters';

@Component({
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
})
export default class BlockForm extends Vue {
  vals: { [key: string]: any; } = {};

  get inputMapping(): ShadowMapping {
    return {};
  }

  get inputValues(): { [key: string]: any; } {
    return this.vals;
  }

  set inputValues(values: { [key: string]: any; }) {
    this.vals = values;
  }

  get block(): Block {
    return this.$props.value as Block;
  }

  set block(block: Block) {
    this.$emit('input', block);
  }

  get profileNames(): string[] {
    return serviceProfiles(this.$store, this.block.serviceId);
  }

  get changed(): boolean {
    const state = toShadow(this.block, this.inputMapping);
    return Object.keys(state)
      .some(key => state[key] !== this.inputValues[key]);
  }

  @Watch('block', { immediate: true, deep: true })
  onBlockUpdate() {
    if (!this.block.isLoading) {
      this.inputValues = deepCopy(toShadow(this.block, this.inputMapping));
    }
  }

  cancelChanges() {
    this.inputValues = deepCopy(toShadow(this.block, this.inputMapping));
  }

  confirmChanges() {
    this.block = fromShadow(this.inputValues, this.inputMapping, { ...this.block }) as Block;
  }
}
