<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import WidgetBase from '@/components/Widget/WidgetBase';

import QuickActionsBasic from './QuickActionsBasic.vue';
import QuickActionsFull from './QuickActionsFull.vue';

@Component({
  components: {
    Basic: QuickActionsBasic,
    Full: QuickActionsFull,
  },
})
export default class QuickActionsWidget extends WidgetBase {
  @Prop({ type: String, required: false })
  public readonly openStep!: string;
}
</script>

<template>
  <component :is="mode" :crud="crud" :class="cardClass" :open-step="openStep">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode">
        <template #actions>
          <ExportAction :crud="crud" />
          <WidgetActions :crud="crud" />
        </template>
      </component>
    </template>
  </component>
</template>
