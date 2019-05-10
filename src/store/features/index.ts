import Vue from 'vue';
import store from '@/store';
import { Module, VuexModule, Mutation, Action, getModule } from 'vuex-module-decorators';
import { Arrangement, Deleter, Feature, Validator } from './types';
import get from 'lodash/get';

@Module({ store, namespaced: true, dynamic: true, name: 'features' })
export class FeatureModule extends VuexModule {
  public features: Record<string, Feature> = {};
  public arrangements: Record<string, Arrangement> = {};

  public get featureIds(): string[] {
    return Object.keys(this.features);
  }

  public get featureValues(): Feature[] {
    return Object.values(this.features);
  }

  public get arrangementIds(): string[] {
    return Object.keys(this.arrangements);
  }

  public get arrangementValues(): Arrangement[] {
    return Object.values(this.arrangements);
  }

  public get featureById(): (id: string) => Feature {
    return id => this.features[id] || null;
  }

  public get displayNameById(): (id: string) => string {
    return id => get(this.features, [id, 'displayName']);
  }

  public get validatorById(): (id: string) => Validator {
    return id => get(this.features, [id, 'validator'], () => true);
  }

  public get wizardById(): (id: string) => string {
    return id => get(this.features, [id, 'wizard']);
  }

  public get widgetById(): (id: string, config: any, selector?: boolean) => string | undefined {
    return (id: string, config: any, selector: boolean = true) => {
      const feature = this.features[id] || {};
      return selector && feature.selector
        ? feature.selector(config)
        : feature.widget;
    };
  }

  public get widgetSizeById(): (id: string) => { cols: number; rows: number } {
    return id => get(this.features, [id, 'widgetSize'], Object.assign({}, { cols: 3, rows: 2 }));
  }

  public get formById(): (id: string) => string | undefined {
    return id => get(this.features, [id, 'form']);
  }

  public get deletersById(): (id: string) => Deleter[] {
    return id => get(this.features, [id, 'deleters'], []);
  }

  @Mutation
  public commitFeature(feature: Feature): void {
    Vue.set(this.features, feature.id, feature);
  }

  @Mutation
  public commitArrangement(arrangement: Arrangement): void {
    Vue.set(this.arrangements, arrangement.id, arrangement);
  }

  @Action({ commit: 'commitFeature' })
  public async createFeature(feature: Feature): Promise<Feature> {
    return feature;
  }

  @Action({ commit: 'commitArrangement' })
  public async createArrangement(arrangement: Arrangement): Promise<Arrangement> {
    return arrangement;
  }
}

export default getModule(FeatureModule);
