import { Dialog } from 'quasar';
import { Component } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import { GraphConfig } from '@/components/Graph/types';
import WidgetBase from '@/components/Widget/WidgetBase';
import sparkStore from '@/plugins/spark/store';
import { GraphValueAxes, QueryParams } from '@/store/history';

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

  public get queryParams(): QueryParams {
    return this.widget.config.queryParams || {
      duration: '10m',
    };
  }

  public get graphAxes(): GraphValueAxes {
    return this.widget.config.graphAxes || {};
  }

  public get renamedTargets(): { [key: string]: string } {
    return {};
  }

  public get graphCfg(): GraphConfig {
    const blockFmt = (val: string): string => [this.blockId, val].join('/');
    const serviceFmt = (val: string): string => [this.serviceId, this.blockId, val].join('/');

    return {
      // persisted in config
      params: this.queryParams,
      axes: this.graphAxes,
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
    };
  }

  public set graphCfg(config: GraphConfig) {
    this.saveConfig({
      ...this.widget.config,
      queryParams: { ...config.params },
      graphAxes: { ...config.axes },
    });
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
