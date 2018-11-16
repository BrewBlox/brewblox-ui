import WidgetBase from '@/components/Widget/WidgetBase';
import Component from 'vue-class-component';
import { Block } from '../state';
import { fetchBlock, saveBlock } from '../store/actions';
import { blockById } from '../store/getters';
import { QueryParams } from '@/store/history/state';

@Component
export default class BlockWidget extends WidgetBase {
  modalOpen: boolean = false;
  slideIndex: number = 0;

  get serviceId(): string {
    return this.$props.config.serviceId;
  }

  get blockId(): string {
    return this.$props.config.blockId;
  }

  get block(): Block {
    return blockById(this.$store, this.serviceId, this.blockId);
  }

  get additionalInfo() {
    return {
      'Widget ID': this.$props.id,
      'Block ID': this.blockId,
      'Service ID': this.serviceId,
      'Feature type': this.$props.type,
    };
  }

  get subtitles(): string[] {
    return [];
  }

  get subtitle() {
    return this.subtitles[this.slideIndex] || '';
  }

  get horizontal() {
    return this.$props.cols >= 4;
  }

  get orientationClass() {
    return this.horizontal ? 'row' : 'column';
  }

  get queryParams(): QueryParams {
    return this.$props.config.queryParams || {
      approxPoints: 200,
      duration: '10m',
    };
  }

  set queryParams(queryParams: QueryParams) {
    this.$props.onConfigChange(this.$props.id, { ...this.$props.config, queryParams });
  }

  refreshBlock() {
    fetchBlock(this.$store, this.serviceId, this.block);
  }

  saveBlock(block: Block = this.block) {
    saveBlock(this.$store, this.serviceId, block);
  }

  callAndSaveBlock(func: (v: any) => void) {
    return (v: any) => { func(v); this.saveBlock(); };
  }
}
