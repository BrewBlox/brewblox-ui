import { GraphConfig } from '@/components/Graph/state';
import WidgetBase from '@/components/Widget/WidgetBase';
import { QueryParams, GraphValueAxes } from '@/store/history/state';
import Component from 'vue-class-component';
import { Block } from '../state';
import { fetchBlock, renameBlock, saveBlock } from '../store/actions';
import { blockById, drivenChains } from '../store/getters';
import { Watch } from 'vue-property-decorator';

@Component
export default class BlockWidget extends WidgetBase {
  protected modalOpen: boolean = false;

  protected get me(): BlockWidget {
    return this;
  }

  protected get formProps(): any {
    return {
      ...this.$props,
      field: this.block,
      onChangeField: this.saveBlock,
      onChangeBlockId: this.changeBlockId,
      onSwitchBlockId: this.switchBlockId,
      // Block widgets can't independently change title - it is set to block ID
      onChangeTitle: null,
    };
  }

  protected get serviceId(): string {
    return this.$props.config.serviceId;
  }

  protected get blockId(): string {
    return this.$props.config.blockId;
  }

  protected get block(): Block {
    return blockById(this.$store, this.serviceId, this.blockId);
  }

  protected get isDriven(): boolean {
    return drivenChains(this.$store, this.serviceId)
      .some((chain: string[]) => chain[0] === this.blockId);
  }

  protected colMinBlocks(minBlocksForRow: number, colsTrue: number, colsFalse: number): string {
    const cols = this.$props.cols >= minBlocksForRow ? colsTrue : colsFalse;
    return `col-${cols.toString()}`;
  }

  protected gridStyle(items: number): { [key: string]: string } {
    if (items < 4) {
      return {};
    }
    return {
      display: 'grid',
      gridTemplateRows: `repeat(${this.$props.cols >= 4 ? Math.ceil(items / 2) : items}, 1fr)`,
      gridTemplateColumns: `repeat(${this.$props.cols >= 4 ? 2 : 1}, 1fr)`,
      gridAutoFlow: 'column',
      gridGap: '0 5%',
    };
  }

  protected get queryParams(): QueryParams {
    return this.$props.config.queryParams || {
      duration: '10m',
    };
  }

  protected get graphAxes(): GraphValueAxes {
    return this.$props.config.graphAxes || {};
  }

  protected get renamedTargets(): { [key: string]: string } {
    return {};
  }

  protected get graphCfg(): GraphConfig {
    const blockFmt = (val: string): string => [this.blockId, val].join('/');
    const serviceFmt = (val: string): string => [this.serviceId, this.blockId, val].join('/');

    return {
      // persisted in config
      params: this.queryParams,
      axes: this.graphAxes,
      // constants
      layout: {
        title: this.$props.id,
      },
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

  protected set graphCfg(config: GraphConfig) {
    this.saveConfig({
      ...this.$props.config,
      queryParams: { ...config.params },
      graphAxes: { ...config.axes },
    });
  }

  @Watch('blockId', { immediate: true })
  private fixWidgetTitle(): void {
    if (this.blockId !== this.widgetTitle && this.$props.onChangeTitle) {
      this.$props.onChangeTitle(this.$props.id, this.blockId);
    }
  }

  protected openModal(): void {
    this.modalOpen = true;
  }

  protected async refreshBlock(): Promise<void> {
    await fetchBlock(this.$store, this.serviceId, this.block)
      .catch(err => this.$q.notify(err.toString()));
  }

  protected async saveBlock(block: Block = this.block): Promise<void> {
    await saveBlock(this.$store, this.serviceId, block)
      .catch((err: Error) => {
        this.$q.notify({
          icon: 'error',
          color: 'negative',
          message: err.toString(),
        });
        this.$forceUpdate();
      });
  }

  protected callAndSaveBlock(func: (v: any) => void): (v: any) => void {
    return (v: any) => { func(v); this.saveBlock(); };
  }

  protected changeBlockId(newId: string): void {
    renameBlock(this.$store, this.serviceId, this.blockId, newId)
      .catch(err => this.$q.notify(err.toString()));
  }

  protected async switchBlockId(blockId: string): Promise<void> {
    await this.saveConfig({ ...this.$props.config, blockId });
  }
}
