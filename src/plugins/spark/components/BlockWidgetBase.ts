import { Layout } from 'plotly.js';
import { Component, Prop } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';
import { GraphConfig, QueryParams } from '@/plugins/history/types';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';

import { blockGraphCfg } from '../helpers';
import type { Block, BlockCrud } from '../types';
import type { BlockConfig, BlockSpec } from '../types';

@Component
export default class BlockWidgetBase<BlockT extends Block = Block>
  extends WidgetBase<BlockConfig> {

  @Prop({ type: Boolean, default: false })
  public readonly volatileBlock!: boolean;

  public get crud(): BlockCrud<BlockT> {
    const initial = this.initialCrud as BlockCrud<BlockT>;
    // We want to avoid calling member getters, as this may create circular lookups
    const { serviceId, blockId } = initial.widget.config;
    const module = sparkStore.moduleById(serviceId)!;
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
    return sparkStore.moduleById(this.serviceId)!;
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
    return this.sparkModule
      .limiters[this.blockId]
      ?.join(', ')
      || null;
  }

  public get spec(): BlockSpec<BlockT> {
    return sparkStore.spec(this.block) as BlockSpec<BlockT>;
  }

  public get hasGraph(): boolean {
    return this.crud.isStoreBlock
      && this.spec.fields.some(f => f.graphed);
  }

  public get graphCfg(): GraphConfig {
    return blockGraphCfg(this.crud);
  }

  public set graphCfg(config: GraphConfig) {
    this.$set(this.widget.config, 'queryParams', { ...config.params });
    this.$set(this.widget.config, 'graphAxes', { ...config.axes });
    this.$set(this.widget.config, 'graphLayout', { ...config.layout });
    this.saveConfig();
  }

  public saveGraphParams(params: QueryParams): void {
    this.$set(this.widget.config, 'queryParams', params);
    this.saveConfig();
  }

  public saveGraphLayout(layout: Partial<Layout>): void {
    this.$set(this.widget.config, 'graphLayout', layout);
    this.saveConfig();
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
