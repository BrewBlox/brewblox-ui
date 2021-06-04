import { markRaw } from 'vue';
import { Action, Module, Mutation, VuexModule } from 'vuex-class-modules';

import { BlockType, Link, UserBlockType } from '@/shared-types';
import store from '@/store';
import { deepCopy, extendById, filterById, findById, findByKey } from '@/utils/functional';

import type { BlockAddress, BlockSpec, StoredDataPreset } from '../types';
import type { Block, BlockFieldAddress, BlockFieldSpec } from '../types';
import * as api from './api';
import presetsApi from './presets-api';
import { SparkServiceModule } from './spark-module';

export { SparkServiceModule } from './spark-module';


@Module({ generateMutationSetters: true })
export class SparkGlobalModule extends VuexModule {
  public modules: SparkServiceModule[] = [];
  public presets: StoredDataPreset[] = [];
  public blockSpecs: BlockSpec[] = [];
  public fieldSpecs: BlockFieldSpec[] = [];

  public get serviceIds(): string[] {
    return this.modules.map(v => v.id);
  }

  public get presetIds(): string[] {
    return this.presets.map(v => v.id);
  }

  public moduleById(serviceId: Nullable<string>): SparkServiceModule | null {
    if (!serviceId) { return null; }
    return this.modules.find(v => v.id === serviceId) ?? null;
  }

  public blockById<T extends Block>(serviceId: Nullable<string>, blockId: Nullable<string>): T | null {
    if (!serviceId || !blockId) { return null; }
    return this.moduleById(serviceId)?.blockById<T>(blockId) ?? null;
  }

  public blockByAddress<T extends Block>(addr: T | BlockAddress | null): T | null {
    if (!addr) { return null; }
    return this.moduleById(addr.serviceId)?.blockByAddress<T>(addr) ?? null;
  }

  public blockByLink<T extends Block>(serviceId: Nullable<string>, link: Nullable<Link>): T | null {
    return this.moduleById(serviceId)?.blockByLink<T>(link) ?? null;
  }

  public fieldByAddress(addr: BlockFieldAddress | null): any {
    if (!addr) { return null; }
    return this.moduleById(addr.serviceId)?.fieldByAddress(addr) ?? null;
  }

  public serviceBlocks(serviceId: Nullable<string>): Block[] {
    return this.moduleById(serviceId)?.blocks ?? [];
  }

  public presetById(id: string): StoredDataPreset | null {
    return findById(this.presets, id);
  }

  // We're assuming here that a spec is registered for every user block type
  public blockSpecByType<T extends Block>(type: UserBlockType & T['type']): BlockSpec<T>;
  public blockSpecByType<T extends Block>(type: BlockType & T['type']): BlockSpec<T> | null;
  public blockSpecByType<T extends Block>(type: T['type']): BlockSpec<T> | null {
    return findByKey<BlockSpec<T>>(this.blockSpecs as any, 'type', type);
  }

  public blockSpecByAddress<T extends Block>(addr: Nullable<T | BlockAddress>): BlockSpec<T> | null {
    return addr && addr.type
      ? this.blockSpecByType<T>(addr.type as T['type'])
      : null;
  }

  public fieldSpecByAddress(addr: Nullable<BlockFieldAddress>): BlockFieldSpec | null {
    return addr && addr.type && addr.field
      ? this.fieldSpecs.find(f => f.type === addr.type && f.key === addr.field) ?? null
      : null;
  }

  public fieldSpecsByType(type: Nullable<BlockType>): BlockFieldSpec[] {
    return this.fieldSpecs.filter(f => f.type === type);
  }

  public setVolatileBlock(block: Block): void {
    this.moduleById(block.serviceId)?.setVolatileBlock(block);
  }

  public removeVolatileBlock(block: BlockAddress): void {
    this.moduleById(block.serviceId)?.removeVolatileBlock(block);
  }

  @Mutation
  public addBlockSpec<T extends Block>(spec: BlockSpec<T>): void {
    this.blockSpecs = markRaw([...this.blockSpecs, spec]);
  }

  @Mutation
  public addFieldSpecs<T extends Block>(specs: BlockFieldSpec<T>[]): void {
    this.fieldSpecs = markRaw([...this.fieldSpecs, ...(specs as any[])]);
  }

  @Action
  public async saveBlock(block: Block): Promise<void> {
    await this.moduleById(block.serviceId)?.saveBlock(block);
  }

  public async modifyBlock<T extends Block>(block: T, func: ((v: T) => void)): Promise<void> {
    const actual = deepCopy(this.blockByAddress<T>(block));
    if (actual) {
      func(actual);
      return this.saveBlock(actual);
    }
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
      this.presets = extendById(this.presets, preset);
    };
    const onDelete = (id: string): void => {
      this.presets = filterById(this.presets, { id });
    };
    this.presets = await presetsApi.fetch();
    presetsApi.subscribe(onChange, onDelete);
  }
}

export const sparkStore = new SparkGlobalModule({ store, name: 'spark' });
