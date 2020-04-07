import mapKeys from 'lodash/mapKeys';
import { Component, Prop } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';
import { postfixedDisplayNames } from '@/helpers/units';
import { GraphConfig } from '@/plugins/history/types';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';

import { Block, BlockConfig, BlockCrud } from '../types';

@Component
export default class BlockWidgetBase<BlockT extends Block = Block>
  extends WidgetBase<BlockConfig> {

  @Prop({ type: Boolean, default: false })
  public readonly volatileBlock!: boolean;

  public get crud(): BlockCrud<BlockT> {
    const initial = this.initialCrud as BlockCrud<BlockT>;
    // We want to avoid calling member getters, as this may create circular lookups
    const { serviceId, blockId } = initial.widget.config;
    const module = sparkStore.serviceById(serviceId)!;
    return initial.block !== undefined
      ? initial
      : {
        ...this.initialCrud,
        isStoreBlock: true,
        block: module.blockById<BlockT>(blockId)!,
        saveBlock: async (block: BlockT) => module.saveBlock(block),
      };
  }

  public get serviceId(): string {
    return this.widget.config.serviceId;
  }

  public get sparkModule(): SparkServiceModule {
    return sparkStore.serviceById(this.serviceId)!;
  }

  public get blockId(): string {
    return this.widget.config.blockId;
  }

  public get block(): BlockT {
    return this.crud.block;
  }

  public get isDriven(): boolean {
    return this.sparkModule
      .drivenBlocks
      .includes(this.blockId);
  }

  public get constrainers(): string | null {
    const limiting: string[] = this.sparkModule.limiters[this.blockId];
    return limiting ? limiting.join(', ') : null;
  }

  public get hasGraph(): boolean {
    return sparkStore.specs[this.block.type]?.graphTargets !== undefined;
  }

  public get renamedTargets(): Mapped<string> {
    const targets = sparkStore.specs[this.block.type]?.graphTargets;
    return targets !== undefined
      ? postfixedDisplayNames(targets, this.block.data)
      : {};
  }

  public get graphCfg(): GraphConfig {
    const blockFmt = (val: string): string => [this.blockId, val].join('/');
    const serviceFmt = (val: string): string => [this.serviceId, this.blockId, val].join('/');

    return {
      // persisted in config
      params: this.widget.config.queryParams || { duration: '1h' },
      axes: this.widget.config.graphAxes || {},
      // constants
      layout: {
        title: this.widget.title,
      },
      targets: [
        {
          measurement: this.serviceId,
          fields: Object.keys(this.renamedTargets)
            .map(k => blockFmt(k)),
        },
      ],
      renames: mapKeys(this.renamedTargets, (_, key) => serviceFmt(key)),
      colors: {},
    };
  }

  public set graphCfg(config: GraphConfig) {
    this.saveConfig({
      ...this.widget.config,
      queryParams: { ...config.params },
      graphAxes: { ...config.axes },
    });
  }

  public get toolbarComponent(): string {
    return this.inDialog
      ? 'BlockWidgetDialogToolbar'
      : 'BlockWidgetToolbar';
  }

  @Watch('blockId', { immediate: true })
  private fixWidgetTitle(): void {
    if (this.blockId !== this.widget.title && this.isStoreWidget) {
      this.saveWidget({ ...this.widget, title: this.blockId });
    }
  }

  public async refreshBlock(): Promise<void> {
    await this.sparkModule.fetchBlock(this.block)
      .catch(() => { });
  }

  public async saveBlock(block: BlockT = this.block): Promise<void> {
    try {
      await this.crud.saveBlock(block);
    } catch {
      this.$forceUpdate();
    }
  }

  public changeBlockId(newId: string): void {
    this.sparkModule.renameBlock([this.blockId, newId])
      .catch(() => { });
  }

  public async switchBlockId(blockId: string): Promise<void> {
    await this.saveConfig({ ...this.widget.config, blockId });
  }
}
