import Vue from 'vue';
import { Action, Module, Mutation, VuexModule, getModule } from 'vuex-module-decorators';

import store from '@/store';

import { BuilderStage } from '../types';
import {
  createStage as createStageInApi,
  deleteStage as removeStageInApi,
  fetchStages as fetchStagesInApi,
  persistStage as persistStageInApi,
  setup as setupInApi,
} from './api';

const rawError = true;

@Module({ store, namespaced: true, dynamic: true, name: 'builder' })
export class BuilderModule extends VuexModule {
  public stages: Record<string, BuilderStage> = {};

  public get stageIds(): string[] {
    return Object.keys(this.stages);
  }

  public get stageValues(): BuilderStage[] {
    return Object.values(this.stages);
  }

  public get stageById(): (id: string) => BuilderStage {
    return id => this.stages[id] || null;
  }

  @Mutation
  public commitStage(stage: BuilderStage) {
    Vue.set(this.stages, stage.id, { ...stage });
  }

  @Mutation
  public commitAllStages(stages: BuilderStage[]) {
    this.stages = stages.reduce((acc, stage) => ({ ...acc, [stage.id]: stage }), {});
  }

  @Mutation
  public commitRemoveStage(stage: BuilderStage) {
    Vue.delete(this.stages, stage.id);
  }

  @Action({ rawError })
  public async createStage(stage: BuilderStage) {
    this.commitStage(await createStageInApi(stage));
  }

  @Action({ rawError })
  public async saveStage(stage: BuilderStage) {
    this.commitStage(await persistStageInApi(stage));
  }

  @Action({ rawError })
  public async removeStage(stage: BuilderStage) {
    await removeStageInApi(stage)
      .catch(() => { });
    this.commitRemoveStage(stage);
  }

  @Action({ rawError })
  public async setup(): Promise<void> {
    /* eslint-disable no-underscore-dangle */
    const onChange = async (stage: BuilderStage): Promise<void> => {
      const existing = this.stageById(stage.id);
      if (!existing || existing._rev !== stage._rev) {
        this.commitStage(stage);
      }
    };
    const onDelete = (id: string): void => {
      const existing = this.stageById(id);
      if (existing) {
        this.removeStage(existing);
      }
    };
    /* eslint-enable no-underscore-dangle */

    this.commitAllStages(await fetchStagesInApi());
    setupInApi(onChange, onDelete);
  }
}

export const builderStore = getModule(BuilderModule);
