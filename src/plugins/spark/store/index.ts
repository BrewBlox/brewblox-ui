import { Action, Module, Mutation, VuexModule } from 'vuex-class-modules';

import { filterById } from '@/helpers/functional';
import store from '@/store';

import { Block, BlockSpec, StoredDataPreset } from '../types';
import * as api from './api';
import presetsApi from './presets-api';
import { SparkServiceModule } from './spark-service';
export { SparkServiceModule } from './spark-service';

@Module({ generateMutationSetters: true })
export class SparkGlobalModule extends VuexModule {
  public services: SparkServiceModule[] = [];
  public presets: StoredDataPreset[] = [];
  public specs: BlockSpec[] = [];

  public get serviceIds(): string[] {
    return this.services.map(v => v.id);
  }

  public get presetIds(): string[] {
    return this.presets.map(v => v.id);
  }

  public serviceById(serviceId: string | null): SparkServiceModule | null {
    if (!serviceId) { return null; }
    return this.services.find(v => v.id === serviceId) ?? null;
  }

  public blockById<T extends Block>(serviceId: string | null, blockId: string | null): T | null {
    if (!serviceId || !blockId) { return null; }
    const block = this.serviceById(serviceId)
      ?.blocks
      .find(v => v.id === blockId) as T | undefined;
    return block ?? null;
  }

  public serviceBlocks(serviceId: string | null): Block[] {
    return this.serviceById(serviceId)?.blocks ?? [];
  }

  public specById(id: string): BlockSpec {
    return this.specs.find(v => v.id === id)!;
  }

  public spec({ type }: { type: string }): BlockSpec {
    return this.specById(type);
  }

  @Mutation
  public setPreset(preset: StoredDataPreset): void {
    this.presets = filterById(this.presets, preset, true);
  }

  @Action
  public async createPreset(preset: StoredDataPreset): Promise<void> {
    this.setPreset(await presetsApi.create(preset));
  }

  @Action
  public async savePreset(preset: StoredDataPreset): Promise<void> {
    this.setPreset(await presetsApi.persist(preset));
  }

  @Action
  public async removePreset(preset: StoredDataPreset): Promise<void> {
    await presetsApi.remove(preset);
    this.presets = filterById(this.presets, preset);
  }

  @Action
  public async registerSpecs(specs: BlockSpec[]): Promise<void> {
    this.specs = specs;
  }

  @Action
  public async saveBlock(block: Block): Promise<void> {
    await this.serviceById(block.serviceId)?.saveBlock(block);
  }

  @Action
  public async createBlock(block: Block): Promise<void> {
    await this.serviceById(block.serviceId)?.createBlock(block);
  }

  @Action
  public async removeBlock(block: Block): Promise<void> {
    await this.serviceById(block.serviceId)?.removeBlock(block);
  }

  @Action
  public async validateService(serviceId: string): Promise<boolean> {
    return await api.validateService(serviceId);
  }

  @Action
  public async addService(serviceId: string): Promise<void> {
    if (this.services.find(v => v.id === serviceId)) {
      throw new Error(`Service '${serviceId}' already exists`);
    }

    const service = new SparkServiceModule(serviceId, { store, name: `spark__${serviceId}` });
    this.services = [...this.services, service];
    await service.start();
  }

  @Action
  public async removeService(serviceId: string): Promise<void> {
    this.services.find(v => v.id === serviceId)?.stop();
    this.services = filterById(this.services, { id: serviceId });
  }

  @Action
  public async start(): Promise<void> {
    const onChange = async (preset: StoredDataPreset): Promise<void> => {
      const existing = this.presets.find(v => v.id === preset.id);
      if (!existing || existing._rev !== preset._rev) {
        this.setPreset(preset);
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
