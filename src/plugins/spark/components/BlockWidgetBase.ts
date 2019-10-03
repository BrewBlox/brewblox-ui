import get from 'lodash/get';
import { Component, Prop } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import { GraphConfig } from '@/components/Graph/types';
import WidgetBase from '@/components/Widget/WidgetBase';
import { postfixedDisplayNames } from '@/helpers/units';
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

  public get inDialog(): boolean {
    return this.context.container === 'Dialog';
  }

  public get toolbarComponent(): string {
    return this.inDialog
      ? 'BlockWidgetDialogToolbar'
      : 'BlockWidgetToolbar';
  }

  public get cardClass(): string[] {
    return this.inDialog
      ? ['widget-modal']
      : ['text-white', 'scroll', 'widget-dashboard'];
  }

  @Watch('blockId', { immediate: true })
  private fixWidgetTitle(): void {
    if (this.blockId !== this.widget.title && this.isStoreWidget) {
      this.saveWidget({ ...this.widget, title: this.blockId });
    }
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
