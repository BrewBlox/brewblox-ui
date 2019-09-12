import get from 'lodash/get';
import { Component, Prop } from 'vue-property-decorator';

import { GraphConfig } from '@/components/Graph/types';
import CrudComponent, { Crud } from '@/components/Widget/CrudComponent';
import { createDialog } from '@/helpers/dialog';
import { showBlockDialog } from '@/helpers/dialog';
import { postfixedDisplayNames } from '@/helpers/units';
import { sparkStore } from '@/plugins/spark/store';

import { blockIdRules } from '../helpers';
import { Block } from '../types';

export interface BlockCrud extends Crud {
  block: Block;
  isStoreBlock: boolean;
  saveBlock: (block: Block) => unknown | Promise<unknown>;
}

@Component
export default class BlockCrudComponent extends CrudComponent {
  private activeDialog: any = null;

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

  public get constrainers(): string | null {
    const limiting: string[] = sparkStore.limiters(this.serviceId)[this.blockId];
    return limiting ? limiting.join(', ') : null;
  }

  public get hasGraph(): boolean {
    return !!get(sparkStore.specs, [this.block.type, 'graphTargets'], null);
  }

  public get renamedTargets(): Record<string, string> {
    const targets = get(sparkStore.specs, [this.block.type, 'graphTargets'], null);
    return !!targets
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
      renames: Object.entries(this.renamedTargets)
        .reduce((acc, [k, v]) => ({ ...acc, [serviceFmt(k)]: v }), {}),
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

  public async saveBlock(block: Block = this.block): Promise<void> {
    await this.crud.saveBlock(block);
  }

  public async removeBlock(): Promise<void> {
    if (this.isStoreBlock) {
      await sparkStore.removeBlock([this.serviceId, this.block]);
      this.closeDialog();
    }
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

  public openModal(opts: { formProps?: any } = {}): void {
    const { formProps } = opts;
    this.activeDialog = createDialog({
      component: 'FormDialog',
      root: this.$root,
      getCrud: () => ({ ...this.crud, closeDialog: this.closeDialog }),
      getProps: () => formProps,
    });
  }

  public closeDialog(): void {
    if (this.activeDialog) {
      this.activeDialog.hide();
      this.activeDialog = null;
    }
    this.closeDialog();
  }

  public showOtherBlock(block: Block, props: any = {}): void {
    showBlockDialog(block, props);
  }

  public startChangeBlockId(): void {
    const blockId = this.blockId;
    createDialog({
      component: 'InputDialog',
      title: 'Change Block name',
      message: `Choose a new name for '${this.blockId}'`,
      rules: blockIdRules(this.serviceId),
      value: blockId,
    })
      .onOk(async (newId: string) => {
        await this.changeBlockId(newId);
        this.closeDialog();
      });
  }

  public startSwitchBlock(): void {
    createDialog({
      component: 'BlockDialog',
      title: 'Choose a Block',
      message: 'You can change the Block that will be displayed by this widget',
      filter: block => block.type === this.block.type,
      root: this.$root,
      serviceId: this.block.serviceId,
    })
      .onOk(block => this.switchBlock(block.id));
  }

  public startBlockInfo(): void {
    createDialog({
      component: 'BlockInfoDialog',
      block: this.block,
      root: this.$root,
    });
  }

  public startRemoveBlock(): void {
    createDialog({
      title: 'Remove Block',
      message: `Are you sure you want to remove ${this.block.id}?`,
      cancel: true,
      dark: true,
      persistent: true,
    })
      .onOk(this.removeBlock);
  }
}
