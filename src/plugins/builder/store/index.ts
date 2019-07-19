import Vue from 'vue';
import { Action, Module, Mutation, VuexModule, getModule } from 'vuex-module-decorators';

import store from '@/store';

import { BuilderLayout } from '../types';
import {
  createLayout as createLayoutInApi,
  deleteLayout as removeLayoutInApi,
  fetchLayouts as fetchLayoutsInApi,
  persistLayout as persistLayoutInApi,
  setup as setupInApi,
} from './api';

const rawError = true;

@Module({ store, namespaced: true, dynamic: true, name: 'builder' })
export class BuilderModule extends VuexModule {
  public layouts: Record<string, BuilderLayout> = {};

  public get layoutIds(): string[] {
    return Object.keys(this.layouts);
  }

  public get layoutValues(): BuilderLayout[] {
    return Object.values(this.layouts);
  }

  public get layoutById(): (id: string) => BuilderLayout {
    return id => this.layouts[id] || null;
  }

  @Mutation
  public commitLayout(layout: BuilderLayout) {
    Vue.set(this.layouts, layout.id, { ...layout });
  }

  @Mutation
  public commitAllLayouts(layouts: BuilderLayout[]) {
    this.layouts = layouts.reduce((acc, layout) => ({ ...acc, [layout.id]: layout }), {});
  }

  @Mutation
  public commitRemoveLayout(layout: BuilderLayout) {
    Vue.delete(this.layouts, layout.id);
  }

  @Action({ rawError })
  public async createLayout(layout: BuilderLayout) {
    this.commitLayout(await createLayoutInApi(layout));
  }

  @Action({ rawError })
  public async saveLayout(layout: BuilderLayout) {
    this.commitLayout(await persistLayoutInApi(layout));
  }

  @Action({ rawError })
  public async removeLayout(layout: BuilderLayout) {
    await removeLayoutInApi(layout)
      .catch(() => { });
    this.commitRemoveLayout(layout);
  }

  @Action({ rawError })
  public async setup(): Promise<void> {
    /* eslint-disable no-underscore-dangle */
    const onChange = async (layout: BuilderLayout): Promise<void> => {
      const existing = this.layoutById(layout.id);
      if (!existing || existing._rev !== layout._rev) {
        this.commitLayout(layout);
      }
    };
    const onDelete = (id: string): void => {
      const existing = this.layoutById(id);
      if (existing) {
        this.removeLayout(existing);
      }
    };
    /* eslint-enable no-underscore-dangle */

    this.commitAllLayouts(await fetchLayoutsInApi());
    setupInApi(onChange, onDelete);
  }
}

export const builderStore = getModule(BuilderModule);
