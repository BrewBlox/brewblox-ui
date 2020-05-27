import { uid } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import CrudComponent from '@/components/CrudComponent';
import { createDialog } from '@/helpers/dialog';
import { createBlockDialog } from '@/helpers/dialog';
import { saveFile } from '@/helpers/import-export';
import notify from '@/helpers/notify';
import type { GraphConfig } from '@/plugins/history/types';
import { deepCopy } from '@/plugins/spark/parse-object';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import type { Block, BlockCrud } from '@/plugins/spark/types';
import type { BlockConfig, BlockSpec } from '@/plugins/spark/types';
import { dashboardStore } from '@/store/dashboards';

import { blockGraphCfg, blockIdRules, canDisplay, tryDisplayBlock } from '../helpers';


@Component
export default class BlockCrudComponent<BlockT extends Block = Block>
  extends CrudComponent<BlockConfig> {

  @Prop({ type: Object, required: true })
  public readonly crud!: BlockCrud<BlockT>;

  public get block(): BlockT {
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

  public get sparkModule(): SparkServiceModule {
    return sparkStore.moduleById(this.serviceId)!;
  }

  public get isDriven(): boolean {
    return this.sparkModule
      .drivenBlocks
      .includes(this.blockId);
  }

  public get canDisplay(): boolean {
    return this.crud.isStoreBlock && canDisplay(this.block);
  }

  public get constrainers(): string | null {
    return this.sparkModule
      .limiters[this.blockId]
      ?.join(', ')
      || null;
  }

  public get spec(): BlockSpec<BlockT> {
    return sparkStore.spec(this.block);
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

  public async saveBlock(block: BlockT = this.block): Promise<void> {
    await this.crud.saveBlock(block);
  }

  public async saveStoreBlock(block: Block | null): Promise<void> {
    if (block !== null) {
      await sparkStore.saveBlock(block);
    }
  }

  public async removeBlock(): Promise<void> {
    if (this.isStoreBlock) {
      await sparkStore.removeBlock(this.block);
      this.closeDialog();
    }
  }

  public async refreshBlock(): Promise<void> {
    if (this.isStoreBlock) {
      await this.sparkModule.fetchBlock(this.block)
        .catch(() => { });
    }
  }

  public async changeBlockId(newId: string): Promise<void> {
    if (this.isStoreBlock) {
      await this.sparkModule.renameBlock([this.blockId, newId])
        .catch(() => { });
    } else {
      await this.saveBlock({ ...this.block, id: newId });
    }
  }

  public async switchBlock(blockId: string): Promise<void> {
    await this.saveConfig({ ...this.widget.config, blockId });
  }

  public showOtherBlock(block: Block | null, props: any = {}): void {
    createBlockDialog(block, { props });
  }

  public startMakeWidget(): void {
    const id = uid();
    createDialog({
      parent: this,
      title: 'Make widget',
      message: `On which dashboard do you want to create a widget for '${this.widget.title}'?`,
      style: 'overflow-y: scroll',
      options: {
        type: 'radio',
        model: '',
        items: dashboardStore.dashboards
          .map(dashboard => ({ label: dashboard.title, value: dashboard.id })),
      },
      cancel: true,
    })
      .onOk((dashboard: string) => {
        if (!dashboard) {
          return;
        }
        dashboardStore.appendWidget({ ...deepCopy(this.widget), id, dashboard, pinnedPosition: null });
        notify.done(`Created ${this.widget.title} on ${dashboardStore.dashboardTitle(dashboard)}`);
      });
  }

  public startChangeBlockId(): void {
    const blockId = this.blockId;
    createDialog({
      parent: this,
      component: 'InputDialog',
      title: 'Change block name',
      message: `Choose a new name for '${this.blockId}'`,
      rules: blockIdRules(this.serviceId),
      clearable: false,
      value: blockId,
    })
      .onOk(async (newId: string) => {
        await this.changeBlockId(newId);
        this.closeDialog();
      });
  }

  public displayBlock(): void {
    tryDisplayBlock(this.block);
  }

  public exportBlock(): void {
    saveFile(this.block, `${this.block.id}.json`);
  }

  public startRemoveBlock(): void {
    createDialog({
      parent: this,
      title: 'Remove block',
      message: `Are you sure you want to remove ${this.block.id}?`,
      cancel: true,
      persistent: true,
    })
      .onOk(this.removeBlock);
  }
}
