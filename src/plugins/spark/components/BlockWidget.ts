import Widget from '@/components/Widget/WidgetBase';
import Component from 'vue-class-component';
import { Block } from '../state';
import { fetchBlock, saveBlock } from '../store/actions';
import { blockById } from '../store/getters';

@Component
export default class BlockWidget extends Widget {
  get serviceId(): string {
    return this.$props.config.serviceId;
  }

  get blockId(): string {
    return this.$props.config.blockId;
  }

  get block(): Block {
    return blockById(this.$store, this.serviceId, this.blockId);
  }

  set block(block: Block) {
    this.saveBlock(block);
  }

  refreshBlock() {
    fetchBlock(this.$store, this.serviceId, this.block);
  }

  saveBlock(block: Block) {
    saveBlock(this.$store, this.serviceId, block);
  }
}
