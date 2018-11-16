import Component from 'vue-class-component';
import { Block } from '@/plugins/spark/state';
import { profileNames, compatibleBlocks } from '@/plugins/spark/store/getters';
import FormBase from '@/components/Widget/FormBase';

@Component({
  props: {
    field: {
      type: Object,
      required: true,
    },
    change: {
      type: Function,
      required: true,
    },
  },
})
export default class BlockForm extends FormBase {
  get block(): Block {
    return this.$props.field as Block;
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
