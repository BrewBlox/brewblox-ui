import { GraphConfig } from '@/components/Graph/state';
import WidgetBase from '@/components/Widget/WidgetBase';
import { QueryParams } from '@/store/history/state';
import Component from 'vue-class-component';
import { Block } from '../state';
import { fetchBlock, renameBlock, saveBlock } from '../store/actions';
import { blockById } from '../store/getters';

@Component
export default class BlockWidget extends WidgetBase {
  $q: any;
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

  get subtitles(): string[] {
    return [];
  }

  get subtitle() {
    return this.subtitles[this.slideIndex] || '';
  }

  navTitle(idx: number) {
    return idx === this.slideIndex
      ? this.subtitles[this.slideIndex]
      : null;
  }

  navIcon(idx: number) {
    return (idx === this.slideIndex && this.navTitle(idx))
      ? null
      : 'fiber_manual_record';
  }

  get horizontal() {
    return this.$props.cols >= 4;
  }

  colMinBlocks(minBlocksForRow: number, colsTrue: number, colsFalse: number){
    const cols = this.$props.cols >= minBlocksForRow ? colsTrue : colsFalse;
    return "col-" +  cols.toString();
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

  get renamedTargets(): { [key: string]: string } {
    return {};
  }

  get graphCfg(): GraphConfig {
    const blockFmt = (val: string) => [this.blockId, val].join('/');
    const serviceFmt = (val: string) => [this.serviceId, this.blockId, val].join('/');

    return {
      // persisted in config
      params: this.queryParams,
      // constants
      layout: {},
      targets: [
        {
          measurement: this.serviceId,
          fields: Object.keys(this.renamedTargets)
            .map(k => blockFmt(k)),
        },
      ],
      renames: Object.entries(this.renamedTargets)
        .reduce((acc, [k, v]) => ({ ...acc, [serviceFmt(k)]: v }), {}),
    };
  }

  set graphCfg(config: GraphConfig) {
    this.queryParams = { ...config.params };
  }

  openModal() {
    this.modalOpen = true;
  }

  refreshBlock() {
    fetchBlock(this.$store, this.serviceId, this.block)
      .catch(err => this.$q.notify(err.toString()));
  }

  saveBlock(block: Block = this.block) {
    saveBlock(this.$store, this.serviceId, block)
      .catch(err => this.$q.notify(err.toString()));
  }

  callAndSaveBlock(func: (v: any) => void) {
    return (v: any) => { func(v); this.saveBlock(); };
  }

  changeBlockId(newId: string) {
    renameBlock(this.$store, this.serviceId, this.blockId, newId)
      .catch(err => this.$q.notify(err.toString()));
  }
}
