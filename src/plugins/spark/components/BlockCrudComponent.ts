import { Component, Prop } from 'vue-property-decorator';

import CrudComponent, { Crud } from '@/components/CrudComponent';
import sparkStore from '@/plugins/spark/store';

import { Block } from '../types';

export interface BlockCrud extends Crud {
  block: Block;
  isStoreBlock: boolean;
  saveBlock: (block: Block) => Promise<void>;
}

@Component
export default class BlockCrudComponent extends CrudComponent {
  @Prop({ type: Object, required: true })
  public readonly crud!: BlockCrud;

  public get block(): Block {
    return this.crud.block;
  }

  public get isStoreBlock(): boolean {
    return this.crud.isStoreBlock;
  }

  public get blockId(): string {
    return this.block.id;
  }

  public get serviceId(): string {
    return this.block.serviceId;
  }

  public get isDriven(): boolean {
    return sparkStore.drivenChains(this.serviceId)
      .some((chain: string[]) => chain[0] === this.block.id);
  }

  public async saveBlock(block: Block = this.block): Promise<void> {
    await this.crud.saveBlock(block);
  }

  public async refreshBlock(): Promise<void> {
    if (this.isStoreBlock) {
      await sparkStore.fetchBlock([this.serviceId, this.block])
        .catch(() => { });
    }
  }

  public async changeBlockId(newId: string): Promise<void> {
    if (this.isStoreBlock) {
      await sparkStore.renameBlock([this.serviceId, this.blockId, newId])
        .catch(() => { });
    } else {
      await this.saveBlock({ ...this.block, id: newId });
    }
  }

  public async switchBlock(blockId: string): Promise<void> {
    await this.saveConfig({ ...this.widget.config, blockId });
  }
}
