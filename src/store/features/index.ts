import get from 'lodash/get';
import Vue from 'vue';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import store from '@/store';

import { Deleter, Feature, FeatureRole, QuickStart, Validator, Watcher } from './types';
export * from './types';


const rawError = true;

@Module({ store, namespaced: true, dynamic: true, name: 'features' })
export class FeatureModule extends VuexModule {
  public features: Mapped<Feature> = {};
  public quickStarts: Mapped<QuickStart> = {};
  public watchers: Watcher[] = [];

  public get featureIds(): string[] {
    return Object.keys(this.features);
  }

  public get featureValues(): Feature[] {
    return Object.values(this.features);
  }

  public get quickStartIds(): string[] {
    return Object.keys(this.quickStarts);
  }

  public get quickStartValues(): QuickStart[] {
    return Object.values(this.quickStarts);
  }

  public get displayName(): (id: string) => string {
    return id => get(this.features, [id, 'displayName']);
  }

  public get role(): (id: string) => FeatureRole {
    return id => get(this.features, [id, 'role']) || 'Other';
  }

  public get validator(): (id: string) => Validator {
    return id => get(this.features, [id, 'validator']) || (() => true);
  }

  public get wizard(): (id: string) => string {
    return id => get(this.features, [id, 'wizard'], '') as string;
  }

  public get widget(): (id: string, config: any) => string | null {
    return (id: string, config: any) => {
      const obj = get(this.features, [id, 'widget'], null);
      return typeof obj === 'function' ? obj(config) : obj;
    };
  }

  public get widgetSize(): (id: string) => { cols: number; rows: number } {
    return id => get(this.features, [id, 'widgetSize']);
  }

  public get form(): (id: string) => string | undefined {
    return id => get(this.features, [id, 'form']);
  }

  public get deleters(): (id: string) => Deleter[] {
    return id => get(this.features, [id, 'deleters']) || [];
  }

  @Mutation
  public commitFeature(feature: Feature): void {
    Vue.set(this.features, feature.id, feature);
  }

  @Mutation
  public commitQuickStart(quickStart: QuickStart): void {
    Vue.set(this.quickStarts, quickStart.id, quickStart);
  }

  @Mutation
  public commitWatcher(watcher: Watcher): void {
    this.watchers.push({ ...watcher });
  }

  @Action({ rawError })
  public async createFeature(feature: Feature): Promise<void> {
    this.commitFeature(feature);
  }

  @Action({ rawError })
  public async createQuickStart(quickStart: QuickStart): Promise<void> {
    this.commitQuickStart(quickStart);
  }

  @Action({ rawError })
  public async createWatcher(watcher: Watcher): Promise<void> {
    this.commitWatcher(watcher);
  }
}

export const featureStore = getModule(FeatureModule);
