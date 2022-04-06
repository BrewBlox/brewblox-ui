import { defineStore } from 'pinia';

import type { BuilderBlueprint, BuilderLayout } from '@/plugins/builder/types';
import { concatById, filterById, findById } from '@/utils/collections';
import { nullFilter } from '@/utils/functional';

import api from './api';

const fallbackBlueprint = (): BuilderBlueprint => ({
  type: '',
  title: 'Unknown Part',
  component: 'UnknownPartComponent',
  cards: [],
  size: () => [1, 1],
  transitions: () => ({}),
});

interface BuilderStoreState {
  blueprints: BuilderBlueprint[];
  focusWarningEnabled: boolean;
  lastLayoutId: string | null;
  layouts: BuilderLayout[];
}

export const useBuilderStore = defineStore('builderStore', {
  state: (): BuilderStoreState => ({
    blueprints: [],
    focusWarningEnabled: true,
    lastLayoutId: null,
    layouts: [],
  }),
  getters: {
    layoutIds: (state): string[] => state.layouts.map((v) => v.id),
    blueprintTypes: (state): string[] => state.blueprints.map((v) => v.type),
  },
  actions: {
    layoutById(id: Maybe<string>): BuilderLayout | null {
      return findById(this.layouts, id);
    },

    blueprintByType(type: string): BuilderBlueprint {
      return (
        this.blueprints.find((v) => v.type === type) ?? fallbackBlueprint()
      );
    },

    componentByType(type: string): string {
      const blueprint = this.blueprintByType(type);
      return blueprint.component ?? `${blueprint.type}PartComponent`;
    },

    async createLayout(layout: BuilderLayout): Promise<void> {
      await api.create(layout); // triggers callback
    },

    async saveLayout(layout: BuilderLayout): Promise<void> {
      await api.persist(layout); // triggers callback
    },

    async removeLayout(layout: BuilderLayout): Promise<void> {
      if (this.lastLayoutId === layout.id) {
        this.lastLayoutId = null;
      }
      await api.remove(layout); // triggers callback
    },

    async updateLayoutOrder(ids: string[]): Promise<void> {
      await Promise.all(
        ids
          .map((id) => this.layoutById(id))
          .filter(nullFilter)
          .map((layout, idx) => {
            const order = idx + 1;
            if (order !== layout.order) {
              this.saveLayout({ ...layout, order });
            }
          }),
      );
    },

    async start(): Promise<void> {
      const onChange = async (layout: BuilderLayout): Promise<void> => {
        this.layouts = concatById(this.layouts, layout);
      };
      const onDelete = (id: string): void => {
        this.layouts = filterById(this.layouts, { id });
      };

      this.layouts = await api.fetch();
      api.subscribe(onChange, onDelete);
    },
  },
});
