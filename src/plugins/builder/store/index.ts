import type { BuilderBlueprint, BuilderLayout } from '@/plugins/builder/types';
import { upgradeMetricsConfig } from '@/plugins/history/utils';
import { concatById, filterById, findById } from '@/utils/collections';
import { defineStore } from 'pinia';
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

    async start(): Promise<void> {
      this.layouts = await api.fetch();

      // check if any layouts must be upgraded
      [...this.layouts].forEach((layout) => {
        let dirty = false;
        layout.parts.forEach((part) => {
          if (part.metrics) {
            const upgraded = upgradeMetricsConfig(part.metrics);
            if (upgraded) {
              dirty = true;
              part.metrics = upgraded;
            }
          }
        });
        if (dirty) {
          // Immediately set upgraded layout, to prevent rendering with invalid data
          concatById(this.layouts, layout);
          this.saveLayout(layout);
        }
      });

      api.subscribe(
        (layout: BuilderLayout) => {
          this.layouts = concatById(this.layouts, layout);
        },
        (id: string) => {
          this.layouts = filterById(this.layouts, { id });
        },
      );
    },
  },
});
