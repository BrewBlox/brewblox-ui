import { Block } from '@/plugins/spark/state';
import Component from 'vue-class-component';
import FormBase from '@/components/Form/FormBase';

@Component({
  props: {
    onChangeBlockId: {
      type: Function,
      required: true,
    },
    onSwitchBlockId: {
      type: Function,
      required: false,
    },
  },
})
export default class BlockForm extends FormBase {
  public get blockField(): Block {
    const propBlock: Block = this.$props.field;
    const actualBlock: Block = { ...propBlock, data: propBlock.data || this.defaultData() };
    if (!propBlock.data && actualBlock.data) {
      this.$props.onChangeField(actualBlock);
    }
    return actualBlock;
  }

  public get block(): Block {
    return this.blockField;
  }

  public get serviceId(): string {
    return this.block.serviceId;
  }

  public presets(): { label: string; value: Record<string, any> }[] {
    return [];
  }

  public defaultData(): Record<string, any> | null {
    return null;
  }

  public saveBlock(block: Block = this.block): void {
    this.$props.onChangeField({ ...block });
  }

  public callAndSaveBlock(func: (v: any) => void): (v: any) => void {
    return (v: any) => { func(v); this.saveBlock(); };
  }
}
