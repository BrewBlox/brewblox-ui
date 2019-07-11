import { Dialog } from 'quasar';
import { Component } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import WidgetBase from '@/components/Widget/WidgetBase';
import sparkStore from '@/plugins/spark/store';

import { Block } from '../types';
import { BlockCrud } from './BlockCrudComponent';

@Component
export default class BlockWidget extends WidgetBase {

  public get block(): Block {
    return sparkStore.blockById(this.serviceId, this.blockId);
  }

  public get serviceId(): string {
    return this.widget.config.serviceId;
  }

  public get blockId(): string {
    return this.widget.config.blockId;
  }

  public get crud(): BlockCrud {
    return {
      widget: this.widget,
      isStoreWidget: !this.volatile,
      saveWidget: this.saveWidget,
      block: this.block,
      isStoreBlock: true,
      saveBlock: this.saveBlock,
    };
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
    if (this.blockId !== this.widget.title && !this.volatile) {
      this.saveWidget({ ...this.widget, title: this.blockId });
    }
  }

  public openModal(): void {
    Dialog.create({
      component: 'FormDialog',
      root: this.$root,
      getCrud: () => this.crud,
    });
  }

  public async refreshBlock(): Promise<void> {
    await sparkStore.fetchBlock([this.serviceId, this.block])
      .catch(() => { });
  }

  public async saveBlock(block: Block = this.block): Promise<void> {
    await sparkStore.saveBlock([this.serviceId, block])
      .catch(() => this.$forceUpdate());
  }

  public changeBlockId(newId: string): void {
    sparkStore.renameBlock([this.serviceId, this.blockId, newId])
      .catch(() => { });
  }

  public async switchBlockId(blockId: string): Promise<void> {
    await this.saveConfig({ ...this.widget.config, blockId });
  }
}
