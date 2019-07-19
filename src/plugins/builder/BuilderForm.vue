<script lang="ts">
import { Component } from 'vue-property-decorator';

import CrudComponent from '@/components/Widget/CrudComponent';

import { builderStore } from './store';
import { BuilderConfig, BuilderLayout } from './types';

@Component
export default class BuilderForm extends CrudComponent {

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

  get activeLayoutIds(): string[] {
    return this.widgetConfig.layoutIds;
  }

  toggleLayoutActive(layout: BuilderLayout) {
    if (this.activeLayoutIds.includes(layout.id)) {
      this.saveConfig({
        ...this.widgetConfig,
        layoutIds: this.widgetConfig.layoutIds.filter(id => id !== layout.id),
      });
    }
  }

}
</script>

<template>
  <q-card dark class="maximized bg-dark">
    <FormToolbar :crud="crud" />

    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-btn-dropdown label="Selected layouts" flat no-caps icon="widgets">
            <q-list dark bordered>
              <ActionItem
                v-for="layout in layouts"
                :key="layout.id"
                :label="layout.title"
                :active="activeLayoutIds.includes(layout.id)"
                icon="mdi-view-dashboard-outline"
                @click="toggleLayoutActive(layout)"
              />
            </q-list>
          </q-btn-dropdown>
        </q-item-section>
      </q-item>
      <!-- Set active layout -->
      <!-- Select and sort layouts -->
    </q-card-section>
  </q-card>
</template>
