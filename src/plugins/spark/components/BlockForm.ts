import FormBase from '@/components/Widget/FormBase';
import { Block } from '@/plugins/spark/state';
import Component from 'vue-class-component';

@Component({
  props: {
    changeId: {
      type: Function,
      required: true,
    },
    buttons: {
      type: Boolean,
      default: true,
    },
  },
})
export default class BlockForm extends FormBase {
  get blockField(): Block {
    const propBlock: Block = this.$props.field;
    const actualBlock: Block = { ...propBlock, data: propBlock.data || this.defaultData() };
    if (!propBlock.data) {
      this.$props.change(actualBlock);
    }
    return actualBlock;
  }

  get block(): Block {
    return this.blockField;
  }

  get serviceId() {
    return this.block.serviceId;
  }

  presets(): { label: string, value: Object }[] {
    return [];
  }

  defaultData() {
    return this.presets.length > 0
      ? this.presets()[0].value
      : {};
  }

  saveBlock(block: Block = this.block) {
    this.$props.change(block);
  }

  callAndSaveBlock(func: (v: any) => void) {
    return (v: any) => { func(v); this.saveBlock(); };
  }

  changeBlockId(newId: string) {
    this.$props.changeId(newId);
  }
}
