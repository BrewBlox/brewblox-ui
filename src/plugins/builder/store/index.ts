import Vue from 'vue';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import { objReducer } from '@/helpers/functional';
import store from '@/store';

import { BuilderLayout, PartSpec } from '../types';
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
  public specs: Record<string, PartSpec> = {};
  public editorActive = false;
  public editorTool = '';
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

  public get specIds(): string[] {
    return Object.keys(this.specs);
  }

  public get specValues(): PartSpec[] {
    return Object.values(this.specs);
  }

  public get specById(): (id: string) => PartSpec {
    return id => this.specs[id] || null;
  }

  public get componentById(): (id: string) => string {
    return id => {
      const spec = this.specs[id] || { id: null };
      return spec.component || spec.id;
    };
  }

  @Mutation
  public registerPart(spec: PartSpec): void {
    Vue.set(this.specs, spec.id, { ...spec });
  }

  @Mutation
  public commitEditorActive(active: boolean): void {
    this.editorActive = active;
  }

  @Mutation
  public commitEditorTool(tool: string): void {
    this.editorTool = tool;
  }

  @Mutation
  public commitLayout(layout: BuilderLayout): void {
    Vue.set(this.layouts, layout.id, { ...layout });
  }

  @Mutation
  public commitAllLayouts(layouts: BuilderLayout[]): void {
    this.layouts = layouts.reduce(objReducer('id'), {});
  }

  @Mutation
  public commitRemoveLayout(layout: BuilderLayout): void {
    Vue.delete(this.layouts, layout.id);
  }

  @Action({ rawError })
  public async createLayout(layout: BuilderLayout): Promise<void> {
    this.commitLayout(await createLayoutInApi(layout));
  }

  @Action({ rawError })
  public async saveLayout(layout: BuilderLayout): Promise<void> {
    this.commitLayout(await persistLayoutInApi(layout));
  }

  @Action({ rawError })
  public async removeLayout(layout: BuilderLayout): Promise<void> {
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
