import { Component, Prop } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import WidgetBase from '@/components/Widget/WidgetBase';
import { sparkStore } from '@/plugins/spark/store';

import { Block } from '../types';
import { BlockCrud } from './BlockCrudComponent';

@Component
export default class BlockWidgetBase extends WidgetBase {

  @Prop({ type: Boolean, default: false })
  public readonly volatileBlock!: boolean;

  public get crud(): BlockCrud {
    const initial = this.initialCrud as BlockCrud;
    // We want to avoid calling member getters, as this may create circular lookups
    const { serviceId, blockId } = initial.widget.config;
    return initial.block !== undefined
      ? initial
      : {
        ...this.initialCrud,
        isStoreBlock: true,
        block: sparkStore.blockById(serviceId, blockId),
        saveBlock: async (block: Block) => sparkStore.saveBlock([serviceId, block]),
      };
  }

  public get serviceId(): string {
    return this.widget.config.serviceId;
  }

  public get blockId(): string {
    return this.widget.config.blockId;
  }

  public get block(): Block {
    return this.crud.block;
  }

  public get isDriven(): boolean {
    return sparkStore.drivenChains(this.serviceId)
      .some((chain: string[]) => chain[0] === this.blockId);
  }

  public get constrainers(): string | null {
    const limiting: string[] = sparkStore.limiters(this.serviceId)[this.blockId];
    return limiting ? limiting.join(', ') : null;
  }

  @Watch('blockId', { immediate: true })
  private fixWidgetTitle(): void {
    if (this.blockId !== this.widget.title && this.isStoreWidget) {
      this.saveWidget({ ...this.widget, title: this.blockId });
    }
  }

  public openModal(args: Record<string, any> = {}): void {
    this.showForm(args);
  }

  public async refreshBlock(): Promise<void> {
    await sparkStore.fetchBlock([this.serviceId, this.block])
      .catch(() => { });
  }

  public async saveBlock(block: Block = this.block): Promise<void> {
    try {
      await this.crud.saveBlock(block);
    } catch {
      this.$forceUpdate();
    }
  }

  public changeBlockId(newId: string): void {
    sparkStore.renameBlock([this.serviceId, this.blockId, newId])
      .catch(() => { });
  }

  public async switchBlockId(blockId: string): Promise<void> {
    await this.saveConfig({ ...this.widget.config, blockId });
  }
}
