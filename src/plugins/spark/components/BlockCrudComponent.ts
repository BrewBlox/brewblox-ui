import get from 'lodash/get';
import mapKeys from 'lodash/mapKeys';
import { uid } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import CrudComponent from '@/components/CrudComponent';
import { createDialog } from '@/helpers/dialog';
import { showBlockDialog } from '@/helpers/dialog';
import { saveFile } from '@/helpers/import-export';
import { postfixedDisplayNames } from '@/helpers/units';
import { deepCopy } from '@/helpers/units/parseObject';
import { GraphConfig } from '@/plugins/history/types';
import { sparkStore } from '@/plugins/spark/store';
import { BlockConfig, BlockCrud } from '@/plugins/spark/types';
import { dashboardStore } from '@/store/dashboards';

import { blockIdRules } from '../helpers';
import { Block } from '../types';


@Component
export default class BlockCrudComponent<BlockT extends Block = Block> extends CrudComponent<BlockConfig> {

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

  public get renamedTargets(): Mapped<string> {
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
      await sparkStore.saveBlock([block.serviceId, block]);
    }
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

  public showOtherBlock(block: Block, props: any = {}): void {
    showBlockDialog(block, { props });
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
        model: undefined,
        items: dashboardStore.dashboardValues
          .map(dashboard => ({ label: dashboard.title, value: dashboard.id })),
      },
      cancel: true,
    })
      .onOk((dashboard: string) => {
        if (!dashboard) {
          return;
        }
        dashboardStore.appendPersistentWidget({ ...deepCopy(this.widget), id, dashboard, pinnedPosition: null });
        this.$q.notify({
          color: 'positive',
          icon: 'file_copy',
          message: `Created ${this.widget.title} on ${dashboardStore.dashboardById(dashboard).title}`,
        });
      });
  }

  public startChangeBlockId(): void {
    const blockId = this.blockId;
    createDialog({
      parent: this,
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

  public exportBlock(): void {
    saveFile(this.block, `${this.block.id}.json`);
  }

  public startRemoveBlock(): void {
    createDialog({
      parent: this,
      title: 'Remove Block',
      message: `Are you sure you want to remove ${this.block.id}?`,
      cancel: true,

      persistent: true,
    })
      .onOk(this.removeBlock);
  }
}
