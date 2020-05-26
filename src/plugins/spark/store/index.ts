import { Action, Module, VuexModule } from 'vuex-class-modules';

import { extendById, filterById, findById } from '@/helpers/functional';
import store from '@/store';

import { Block } from '../types';
import type { BlockAddress, BlockSpec, StoredDataPreset } from '../types';
import * as api from './api';
import presetsApi from './presets-api';
import { SparkServiceModule } from './spark-module';

export { SparkServiceModule } from './spark-module';

@Module({ generateMutationSetters: true })
export class SparkGlobalModule extends VuexModule {
  public modules: SparkServiceModule[] = [];
  public presets: StoredDataPreset[] = [];
  public specs: BlockSpec[] = [];

  public get serviceIds(): string[] {
    return this.modules.map(v => v.id);
  }

  public get presetIds(): string[] {
    return this.presets.map(v => v.id);
  }

  public moduleById(serviceId: string | null): SparkServiceModule | null {
    if (!serviceId) { return null; }
    return this.modules.find(v => v.id === serviceId) ?? null;
  }

  public blockById<T extends Block>(serviceId: string | null, blockId: string | null): T | null {
    if (!serviceId || !blockId) { return null; }
    return this.moduleById(serviceId)?.blockById<T>(blockId) ?? null;
  }

  public blockByAddress<T extends Block>(addr: BlockAddress | null): T | null {
    if (!addr || !addr.id || !addr.serviceId) { return null; }
    return this.moduleById(addr.serviceId)?.blockByAddress<T>(addr) ?? null;
  }

  public serviceBlocks(serviceId: string | null): Block[] {
    return this.moduleById(serviceId)?.blocks ?? [];
  }

  public presetById(id: string): StoredDataPreset | null {
    return findById(this.presets, id);
  }

  public specById<T extends Block>(id: T['type']): BlockSpec<T> {
    // We're assuming here that a spec is registered for every descendant interface of Block
    return findById<any>(this.specs, id) as BlockSpec<T>;
  }

  public spec<T extends Block>({ type }: { type: T['type'] }): BlockSpec<T> {
    return this.specById<T>(type);
  }

  @Action
  public async registerSpecs(specs: BlockSpec[]): Promise<void> {
    this.specs = specs;
  }

  @Action
  public async saveBlock(block: Block): Promise<void> {
    await this.moduleById(block.serviceId)?.saveBlock(block);
  }

  @Action
  public async createBlock(block: Block): Promise<void> {
    await this.moduleById(block.serviceId)?.createBlock(block);
  }

  @Action
  public async removeBlock(block: Block): Promise<void> {
    await this.moduleById(block.serviceId)?.removeBlock(block);
  }

  @Action
  public async validateService(serviceId: string): Promise<boolean> {
    return await api.validateService(serviceId);
  }

  @Action
  public async addService(serviceId: string): Promise<void> {
    if (this.moduleById(serviceId)) {
      throw new Error(`Spark service '${serviceId}' already exists`);
    }

    const service = new SparkServiceModule(serviceId, { store, name: `spark__${serviceId}` });
    this.modules = [...this.modules, service];
    await service.start();
  }

  @Action
  public async removeService(serviceId: string): Promise<void> {
    const service = this.moduleById(serviceId);
    if (service) {
      await service.stop();
      this.modules = filterById(this.modules, service);
    }
  }

  @Action
  public async createPreset(preset: StoredDataPreset): Promise<void> {
    await presetsApi.create(preset); // triggers callback
  }

  @Action
  public async savePreset(preset: StoredDataPreset): Promise<void> {
    await presetsApi.persist(preset); // triggers callback
  }

  @Action
  public async removePreset(preset: StoredDataPreset): Promise<void> {
    await presetsApi.remove(preset); // triggers callback
  }

  @Action
  public async start(): Promise<void> {
    const onChange = async (preset: StoredDataPreset): Promise<void> => {
      const existing = this.presets.find(v => v.id === preset.id);
      if (!existing || existing._rev !== preset._rev) {
        this.presets = extendById(this.presets, preset);
      }
    };
    const onDelete = (id: string): void => {
      this.presets = filterById(this.presets, { id });
    };
    this.presets = await presetsApi.fetch();
    presetsApi.subscribe(onChange, onDelete);
  }
}

export const sparkStore = new SparkGlobalModule({ store, name: 'spark' });
