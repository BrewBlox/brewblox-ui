import Component from 'vue-class-component';
import { Block } from '@/plugins/spark/state';
import { profileNames, compatibleBlocks } from '@/plugins/spark/store/getters';
import FormBase from '@/components/Widget/FormBase';

@Component
export default class BlockForm extends FormBase {
  get defaultData() {
    return {};
  }

  get blockField(): Block {
    const propBlock = this.$props.field as Block;
    return { ...propBlock, data: propBlock.data || this.defaultData } as Block;
  }

  get block(): Block {
    return this.blockField;
  }

  get profileNames(): string[] {
    return profileNames(this.$store, this.block.serviceId);
  }

  get profileOpts() {
    return this.profileNames.map((v, idx) => ({ label: v, value: idx }));
  }

  get compatibleBlocks() {
    return compatibleBlocks(this.$store, this.block.serviceId);
  }

  saveBlock(block: Block = this.block) {
    this.$props.change(block);
  }

  callAndSaveBlock(func: (v: any) => void) {
    return (v: any) => { func(v); this.saveBlock(); };
  }
}
