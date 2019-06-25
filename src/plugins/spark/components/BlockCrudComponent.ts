import { Dialog } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import CrudComponent, { Crud } from '@/components/Widget/CrudComponent';
import sparkStore from '@/plugins/spark/store';

import { Block } from '../types';

export interface BlockCrud extends Crud {
  block: Block;
  isStoreBlock: boolean;
  saveBlock: (block: Block) => unknown | Promise<unknown>;
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

  public async saveBlock(block: Block = this.block) {
    await this.crud.saveBlock(block);
  }

  public async removeBlock() {
    if (this.isStoreBlock) {
      await sparkStore.removeBlock([this.serviceId, this.block]);
    }
  }

  public async refreshBlock() {
    if (this.isStoreBlock) {
      await sparkStore.fetchBlock([this.serviceId, this.block])
        .catch(() => { });
    }
  }

  public async changeBlockId(newId: string) {
    if (this.isStoreBlock) {
      await sparkStore.renameBlock([this.serviceId, this.blockId, newId])
        .catch(() => { });
    } else {
      await this.saveBlock({ ...this.block, id: newId });
    }
  }

  public async switchBlock(blockId: string) {
    await this.saveConfig({ ...this.widget.config, blockId });
  }

  public openModal(opts: { formProps?: any; graphProps?: any } = {}): void {
    const { formProps, graphProps } = opts;
    Dialog.create({
      component: 'FormDialog',
      root: this.$root,
      getCrud: () => this.crud,
      getFormProps: () => formProps,
      getGraphProps: () => graphProps,
    });
  }

  public startChangeBlockId() {
    let blockId = this.blockId;
    Dialog.create({
      title: 'Change Block name',
      message: `Choose a new name for '${this.blockId}'`,
      dark: true,
      cancel: true,
      prompt: {
        model: blockId,
        type: 'text',
      },
    })
      .onOk(this.changeBlockId);
  }

  public startSwitchBlock() {
    Dialog.create({
      component: 'BlockDialog',
      title: 'Choose a Block',
      message: 'You can change the Block that will be displayed by this widget',
      filter: block => block.type === this.block.type,
      root: this.$root,
      serviceId: this.block.serviceId,
    })
      .onOk(block => this.switchBlock(block.id));
  }

  public startBlockInfo() {
    Dialog.create({
      component: 'BlockInfoDialog',
      block: this.block,
      root: this.$root,
    });
  }

  public startRemoveBlock() {
    Dialog.create({
      title: 'Remove Block',
      message: `Are you sure you want to remove ${this.block.id}?`,
      cancel: true,
      dark: true,
      persistent: true,
    })
      .onOk(this.removeBlock);
  }
}
