import { Action, Module, Mutation, VuexModule } from 'vuex-class-modules';

import { extendById, filterById } from '@/helpers/functional';
import store from '@/store';

import { BuilderLayout, PartSpec } from '../types';
import api from './api';

const fallbackSpec = (): PartSpec => ({
  id: '',
  title: 'Unknown Part',
  component: 'UnknownPart',
  cards: [],
  size: () => [1, 1],
  transitions: () => ({}),
});

@Module({ generateMutationSetters: true })
export class BuilderModule extends VuexModule {
  public specs: PartSpec[] = [];

  public editorMode = '';
  public lastLayoutId: string | null = null;
  public layouts: BuilderLayout[] = [];

  public get layoutIds(): string[] {
    return this.layouts.map(v => v.id);
  }

  public layoutById(id: string | null): BuilderLayout | null {
    if (id === null) { return null; }
    return this.layouts.find(v => v.id === id) ?? null;
  }

  public get specIds(): string[] {
    return this.specs.map(v => v.id);
  }

  public spec({ type }: { type: string }): PartSpec {
    return this.specs.find(v => v.id === type) ?? fallbackSpec();
  }

  public component({ type }: { type: string }): string {
    const spec = this.spec({ type });
    return spec.component || spec.id;
  }

  @Mutation
  public registerParts(specs: PartSpec[]): void {
    this.specs = specs;
  }

  @Action
  public async createLayout(layout: BuilderLayout): Promise<void> {
    await api.create(layout); // triggers callback
  }

  @Action
  public async saveLayout(layout: BuilderLayout): Promise<void> {
    await api.persist(layout); // triggers callback
  }

  @Action
  public async removeLayout(layout: BuilderLayout): Promise<void> {
    await api.remove(layout); // triggers callback
  }

  @Action
  public async setup(): Promise<void> {
    const onChange = async (layout: BuilderLayout): Promise<void> => {
      const existing = this.layoutById(layout.id);
      if (!existing || existing._rev !== layout._rev) {
        this.layouts = extendById(this.layouts, layout);
      }
    };
    const onDelete = (id: string): void => {
      this.layouts = filterById(this.layouts, { id });
    };

    this.layouts = await api.fetch();
    api.subscribe(onChange, onDelete);
  }
}

export const builderStore = new BuilderModule({ store, name: 'builder' });
