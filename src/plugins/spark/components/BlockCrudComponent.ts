import mapKeys from 'lodash/mapKeys';
import { uid } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import CrudComponent from '@/components/CrudComponent';
import { createDialog } from '@/helpers/dialog';
import { createBlockDialog } from '@/helpers/dialog';
import { saveFile } from '@/helpers/import-export';
import notify from '@/helpers/notify';
import { postfixedDisplayNames } from '@/helpers/units';
import { deepCopy } from '@/helpers/units/parseObject';
import { GraphConfig } from '@/plugins/history/types';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { BlockConfig, BlockCrud } from '@/plugins/spark/types';
import { dashboardStore } from '@/store/dashboards';

import { blockIdRules, canDisplay, tryDisplayBlock } from '../helpers';
import { Block } from '../types';


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
    return sparkStore.serviceById(this.serviceId)!;
  }

  public get isDriven(): boolean {
    return this.sparkModule.drivenBlocks
      .includes(this.blockId);
  }

  public get canDisplay(): boolean {
    return this.crud.isStoreBlock && canDisplay(this.block);
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
          fields: Object.keys(this.renamedTargets).map(k => blockFmt(k)),
        },
      ],
      renames: mapKeys(this.renamedTargets, (_, k) => serviceFmt(k)),
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
        items: dashboardStore.dashboardValues
          .map(dashboard => ({ label: dashboard.title, value: dashboard.id })),
      },
      cancel: true,
    })
      .onOk((dashboard: string) => {
        if (!dashboard) {
          return;
        }
        dashboardStore.appendWidget({ ...deepCopy(this.widget), id, dashboard, pinnedPosition: null });
        notify.done(`Created ${this.widget.title} on ${dashboardStore.dashboardById(dashboard).title}`);
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
