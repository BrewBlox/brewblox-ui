<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import CrudComponent from '@/components/Widget/CrudComponent';
import { GraphConfig } from '@/plugins/history/types';
import { historyStore } from '@/store/history';

interface PeriodDisplay {
  start: boolean;
  duration: boolean;
  end: boolean;
}

@Component
export default class GraphEditor extends CrudComponent {
  tab = 'metrics';

  @Prop({ type: Object, default: () => ({}) })
  readonly downsampling!: any;

  @Prop({ type: Boolean, default: false })
  public readonly inDialog!: boolean;

  get config(): GraphConfig {
    return {
      layout: {},
      params: {},
      targets: [],
      renames: {},
      colors: {},
      axes: {},
      ...this.widget.config,
    };
  }

  created(): void {
    historyStore.fetchKnownKeys();
  }
}
</script>

<template>
  <q-card dark v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />

    <q-tabs v-model="tab" dense active-color="primary" align="justify">
      <q-tab name="metrics" label="Metrics" />
      <q-tab name="period" label="Period" />
      <q-tab name="display" label="Display" />
    </q-tabs>

    <div :class="{'col-grow': true, 'scroll-parent': inDialog}">
      <component :is="inDialog ? 'q-scroll-area' : 'div'">
        <q-tab-panels v-model="tab" animated :class="inDialog ? 'bg-dark-bright' : 'bg-dark'">
          <q-tab-panel dark name="metrics" class="q-pt-none">
            <GraphTargetsEditor :config="config" @update:config="saveConfig" />
          </q-tab-panel>
          <q-tab-panel dark name="period" class="q-pt-none">
            <GraphPeriodEditor :config="config" @update:config="saveConfig" />
          </q-tab-panel>
          <q-tab-panel dark name="display" class="q-pt-none">
            <GraphDisplayEditor :config="config" @update:config="saveConfig" />
          </q-tab-panel>
        </q-tab-panels>
      </component>
    </div>
  </q-card>
</template>

<style scoped>
.scroll-parent {
  height: 500px;
  max-height: 60vh;
}
</style>
