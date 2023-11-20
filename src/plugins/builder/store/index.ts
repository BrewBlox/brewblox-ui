import { defineStore } from 'pinia';
import { computed, ref, shallowRef } from 'vue';
import type { BuilderBlueprint, BuilderLayout } from '@/plugins/builder/types';
import { concatById, filterById, findById } from '@/utils/collections';
import { upgradeLayout } from '../utils';
import api from './api';

export const useBuilderStore = defineStore('builderStore', () => {
  const blueprints = shallowRef<BuilderBlueprint[]>([]);
  const focusWarningEnabled = ref<boolean>(true);
  const lastLayoutId = ref<string | null>(null);
  const layouts = ref<BuilderLayout[]>([]);

  const layoutIds = computed<string[]>(() => layouts.value.map((v) => v.id));
  const blueprintTypes = computed<string[]>(() =>
    blueprints.value.map((v) => v.type),
  );

  function layoutById(id: Maybe<string>): BuilderLayout | null {
    return findById(layouts.value, id);
  }

  function blueprintByType(type: string): BuilderBlueprint | null {
    return blueprints.value.find((v) => v.type === type) ?? null;
  }

  function componentByType(type: string): string {
    const blueprint = blueprintByType(type);
    if (!blueprint) {
      return 'UnknownPartComponent';
    }
    return blueprint.component ?? `${blueprint.type}PartComponent`;
  }

  async function createLayout(layout: BuilderLayout): Promise<void> {
    await api.create(layout); // triggers callback
  }

  async function saveLayout(layout: BuilderLayout): Promise<void> {
    await api.persist(layout); // triggers callback
  }

  async function removeLayout(layout: BuilderLayout): Promise<void> {
    if (lastLayoutId.value === layout.id) {
      lastLayoutId.value = null;
    }
    await api.remove(layout); // triggers callback
  }

  async function start(): Promise<void> {
    const storedLayouts: BuilderLayout[] = await api.fetch();
    const upgradedLayouts: BuilderLayout[] = [];

    storedLayouts.forEach((stored) => {
      const changed = upgradeLayout(stored);
      layouts.value.push(changed ?? stored);
      if (changed) {
        upgradedLayouts.push(changed);
      }
    });

    api.persistMult(upgradedLayouts);

    api.subscribe(
      (layout: BuilderLayout) => {
        layouts.value = concatById(layouts.value, layout);
      },
      (id: string) => {
        layouts.value = filterById(layouts.value, { id });
      },
    );
  }

  return {
    blueprints,
    focusWarningEnabled,
    lastLayoutId,
    layouts,

    layoutIds,
    blueprintTypes,

    layoutById,
    blueprintByType,
    componentByType,
    createLayout,
    saveLayout,
    removeLayout,
    start,
  };
});
