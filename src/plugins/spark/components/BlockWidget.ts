import Widget from '@/components/Widget/Widget';
import Component from 'vue-class-component';
import { Block } from '../state';
import { fetchBlock } from '../store/actions';
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

  refreshBlock() {
    fetchBlock(this.$store, this.serviceId, this.block);
  }
}
