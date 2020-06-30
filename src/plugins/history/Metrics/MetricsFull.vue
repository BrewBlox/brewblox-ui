<script lang="ts">
import defaults from 'lodash/defaults';
import { Component, Prop } from 'vue-property-decorator';

import CrudComponent from '@/components/CrudComponent';

import { MetricsConfig } from './types';

@Component
export default class MetricsFull extends CrudComponent<MetricsConfig> {

  @Prop({ type: Boolean, default: false })
  public readonly inDialog!: boolean;

  get config(): MetricsConfig {
    return defaults(this.widget.config, {
      targets: [],
      renames: {},
      params: {},
      freshDuration: {},
      decimals: {},
    });
  }

}
</script>

<template>
  <MetricsEditor :config="config" class="widget-md" @update:config="saveConfig" />
</template>
