<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';

import MetricsBasic from './MetricsBasic.vue';
import MetricsFull from './MetricsFull.vue';


@Component({
  components: {
    Basic: MetricsBasic,
    Full: MetricsFull,
  },
})
export default class MetricsWidget extends WidgetBase {
  revision = 0;
}
</script>

<template>
  <component :is="mode" :crud="crud" :class="cardClass" :revision="revision">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode">
        <template #actions>
          <ActionItem
            v-if="mode === 'Basic'"
            icon="refresh"
            label="Refresh"
            @click="revision++"
          />
          <WidgetActions :crud="crud" />
        </template>
      </component>
    </template>
  </component>
</template>
