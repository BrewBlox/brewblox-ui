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
  <CardWrapper v-bind="{context}">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode">
        <template #actions>
          <ActionItem
            v-if="mode === 'Basic'"
            icon="refresh"
            label="Refresh"
            @click="revision++"
          />
        </template>
      </component>
    </template>

    <component :is="mode" :crud="crud" :revision="revision" />
  </CardWrapper>
</template>
