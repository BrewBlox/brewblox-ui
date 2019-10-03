<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import WidgetBase from '@/components/Widget/WidgetBase';

import StepViewBasic from './StepViewBasic.vue';
import StepViewFull from './StepViewFull.vue';

@Component({
  components: {
    Basic: StepViewBasic,
    Full: StepViewFull,
  },
})
export default class StepViewWidget extends WidgetBase {
  @Prop({ type: String, required: false })
  public readonly openStep!: string;
}
</script>

<template>
  <component :is="mode" :crud="crud" :class="cardClass" :open-step="openStep">
    <template #toolbar>
      <WidgetDialogToolbar v-if="inDialog" :crud="crud" :mode.sync="mode">
        <template #actions>
          <ExportAction :crud="crud" />
          <WidgetActions :crud="crud" />
        </template>
      </WidgetDialogToolbar>
      <WidgetToolbar v-else :crud="crud" :mode.sync="mode">
        <template #actions>
          <ExportAction :crud="crud" />
          <WidgetActions :crud="crud" />
        </template>
      </WidgetToolbar>
    </template>
  </component>
</template>
