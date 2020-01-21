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
  <MetricsEditor :config="config" @update:config="saveConfig" />
</template>
