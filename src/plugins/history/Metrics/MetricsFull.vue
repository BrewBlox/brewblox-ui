<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import CrudComponent from '@/components/CrudComponent';

import { MetricsConfig } from './types';

@Component
export default class MetricsFull extends CrudComponent<MetricsConfig> {

  @Prop({ type: Boolean, default: false })
  public readonly inDialog!: boolean;

  get config(): MetricsConfig {
    return {
      targets: [],
      renames: {},
      params: {},
      freshDuration: {},
      decimals: {},
      ...this.widget.config,
    };
  }

}
</script>

<template>
  <q-card dark v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />

    <div :class="{'col-grow': true, 'scroll-parent': inDialog}">
      <component :is="inDialog ? 'q-scroll-area' : 'div'">
        <MetricsEditor :config="config" @update:config="saveConfig" />
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
