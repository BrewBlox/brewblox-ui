import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import { Block } from '@/plugins/spark/state';
import { toShadow, fromShadow, ShadowMapping } from '@/helpers/shadow-copy';

@Component({
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
})
export default class BlockForm extends Vue {
  inputMapping: ShadowMapping = {};
  inputValues: { [key: string]: any; } = {};

  get block(): Block {
    return this.$props.value as Block;
  }

  set block(block: Block) {
    this.$emit('input', block);
  }

  get changed(): boolean {
    const state = toShadow(this.block, this.inputMapping);
    return Object.keys(state)
      .some(key => state[key] !== this.inputValues[key]);
  }

  @Watch('block', { immediate: true, deep: true })
  onBlockUpdate() {
    if (!this.block.isLoading) {
      this.inputValues = toShadow(this.block, this.inputMapping);
    }
  }

  cancelChanges() {
    this.inputValues = toShadow(this.block, this.inputMapping);
  }

  confirmChanges() {
    this.block = fromShadow(this.inputValues, this.inputMapping, { ...this.block }) as Block;
  }
}
