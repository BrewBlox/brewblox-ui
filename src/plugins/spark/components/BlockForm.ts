import FormBase from '@/components/Widget/FormBase';
import { Block } from '@/plugins/spark/state';
import { compatibleBlocks, profileNames } from '@/plugins/spark/store/getters';
import Component from 'vue-class-component';

@Component
export default class BlockForm extends FormBase {
  defaultData() {
    return {};
  }

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

  get profiles() {
    return this.block.profiles;
  }

  get profileNames(): string[] {
    return profileNames(this.$store, this.serviceId);
  }

  get profileOpts() {
    return this.profileNames.map((v, idx) => ({ label: v, value: idx }));
  }

  get compatibleBlocks() {
    return compatibleBlocks(this.$store, this.serviceId);
  }

  saveBlock(block: Block = this.block) {
    this.$props.change(block);
  }

  callAndSaveBlock(func: (v: any) => void) {
    return (v: any) => { func(v); this.saveBlock(); };
  }
}
