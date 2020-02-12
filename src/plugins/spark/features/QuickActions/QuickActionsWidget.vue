<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';

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
  <CardWrapper v-bind="{context}">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode">
        <template #menus>
          <WidgetActions :crud="crud">
            <ExportAction :crud="crud" />
          </WidgetActions>
        </template>
      </component>
    </template>
    <component :is="mode" :crud="crud" :open-step="openStep" />
  </CardWrapper>
</template>
