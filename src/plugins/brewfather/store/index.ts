import { Action, Module, VuexModule } from 'vuex-class-modules';

import store from '@/store';

import { BREWFATHER_ID } from '../const';
import { BrewfatherCurrentState, BrewfatherRecipe } from '../types';
import * as api from './api';

@Module({ generateMutationSetters: true })
export class BrewfatherModule extends VuexModule {
  public recipes: BrewfatherRecipe[] = [];
  public messages: string[] = [];
  public state: BrewfatherCurrentState | null = null;

  @Action
  public async fetchRecipes(): Promise<void> {
    await api.fetchRecipes(BREWFATHER_ID);
  }

  @Action
  public async loadRecipe(id: string): Promise<void> {
    await api.loadRecipe(BREWFATHER_ID, id);
  }

  @Action
  public async startMash(): Promise<void> {
    await api.startMashAutomation(BREWFATHER_ID);
  }
}

export const brewfatherStore = new BrewfatherModule({ store, name: 'brewfather' });
