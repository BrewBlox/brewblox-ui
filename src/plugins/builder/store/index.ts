import { Action, Module, VuexModule } from 'vuex-class-modules';

import type { BuilderLayout, PartSpec } from '@/plugins/builder/types';
import store from '@/store';
import { extendById, filterById, findById } from '@/utils/collections';

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

  public focusWarningEnabled = true;
  public lastLayoutId: string | null = null;
  public layouts: BuilderLayout[] = [];

  public get layoutIds(): string[] {
    return this.layouts.map(v => v.id);
  }

  public layoutById(id: Maybe<string>): BuilderLayout | null {
    return findById(this.layouts, id);
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
    if (this.lastLayoutId === layout.id) {
      this.lastLayoutId = null;
    }
    await api.remove(layout); // triggers callback
  }

  @Action
  public async updateLayoutOrder(ids: string[]): Promise<void> {
    await Promise.all(
      ids
        .map(id => this.layoutById(id))
        .filter((v): v is BuilderLayout => v !== null)
        .map((layout, idx) => {
          const order = idx + 1;
          if (order !== layout.order) {
            this.saveLayout({ ...layout, order });
          }
        }),
    );
  }

  @Action
  public async start(): Promise<void> {
    const onChange = async (layout: BuilderLayout): Promise<void> => {
      this.layouts = extendById(this.layouts, layout);
    };
    const onDelete = (id: string): void => {
      this.layouts = filterById(this.layouts, { id });
    };

    this.layouts = await api.fetch();
    api.subscribe(onChange, onDelete);
  }
}

export const builderStore = new BuilderModule({ store, name: 'builder' });
