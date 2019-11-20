<script lang="ts">
import { Component } from 'vue-property-decorator';

import CrudComponent from '@/components/CrudComponent';

import { builderStore } from './store';
import { BuilderConfig, BuilderLayout } from './types';

@Component
export default class BuilderFull extends CrudComponent<BuilderConfig> {

  get layouts(): BuilderLayout[] {
    return builderStore.layoutValues;
  }

  get widgetConfig(): BuilderConfig {
    return {
      currentLayoutId: null,
      layoutIds: [],
      ...this.widget.config as Partial<BuilderConfig>,
    };
  }

  get currentId(): string | null {
    return this.widgetConfig.currentLayoutId;
  }

  get activeLayoutIds(): string[] {
    return this.widgetConfig.layoutIds;
  }

  get activeLayouts(): BuilderLayout[] {
    return this.activeLayoutIds
      .map(builderStore.layoutById)
      .filter(v => !!v);
  }

  set activeLayouts(layouts: BuilderLayout[]) {
    const currentLayoutId = layouts.find(lay => lay.id === this.currentId)
      ? this.currentId
      : null;
    this.saveConfig({
      ...this.widgetConfig,
      currentLayoutId,
      layoutIds: layouts.map(lay => lay.id),
    });
  }

  get inactiveLayouts(): BuilderLayout[] {
    return this.layouts.filter(lay => !this.activeLayoutIds.includes(lay.id));
  }

  get currentLayout(): BuilderLayout | null {
    return builderStore.layoutById(this.widgetConfig.currentLayoutId || '');
  }

  set currentLayout(layout: BuilderLayout | null) {
    this.saveConfig({
      ...this.widgetConfig,
      currentLayoutId: layout ? layout.id : null,
    });
  }
}
</script>

<template>
  <q-card v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />

    <q-card-section>
      <q-item>
        <q-item-section>
          <q-select
            v-model="currentLayout"
            :options="activeLayouts"
            label="Currently displayed layout"
            option-label="title"
            option-value="id"
            clearable
          />
        </q-item-section>
      </q-item>
    </q-card-section>

    <q-card-section
      v-if="layouts.length === 0"
      class="text-italic q-ml-md"
    >
      There are no layouts. Use the Editor to create a new layout.
    </q-card-section>
    <q-card-section v-else class="row">
      <div class="col column">
        <span class="text-italic text-h6 q-ml-md">In this Widget</span>
        <small
          class="text-italic q-ml-md"
        >These are the displayed layouts. Drag to add, remove, or change the display order.</small>
        <draggable v-model="activeLayouts" class="col" group="layout-selector">
          <q-item v-for="lay in activeLayouts" :key="lay.id" dense>
            <q-item-section
              :class="{grabbable: true, ['text-primary']: lay.id === currentId}"
            >
              {{ lay.title }}
            </q-item-section>
          </q-item>
        </draggable>
      </div>
      <div class="col column">
        <span class="text-italic text-h6 q-ml-md">Available</span>
        <small
          class="text-italic q-ml-md"
        >These are all available layouts. They can be displayed by any Builder Widget.</small>
        <draggable :list="inactiveLayouts" class="col" group="layout-selector">
          <q-item v-for="lay in inactiveLayouts" :key="lay.id" dense>
            <q-item-section class="grabbable">
              {{ lay.title }}
            </q-item-section>
          </q-item>
        </draggable>
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.grabbable {
  cursor: grab;
  border: 1px solid gray;
  padding-left: 0.5em;
}
.grabbable:active {
  cursor: grabbing;
}
</style>
