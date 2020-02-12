<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import DisplaySettingsBasic from './DisplaySettingsBasic.vue';
import DisplaySettingsFull from './DisplaySettingsFull.vue';
import { DisplaySettingsBlock } from './types';

@Component({
  components: {
    Basic: DisplaySettingsBasic,
    Full: DisplaySettingsFull,
  },
})
export default class DisplaySettingsWidget
  extends BlockWidgetBase<DisplaySettingsBlock> {
}
</script>

<template>
  <CardWrapper v-bind="{context}">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
    </template>

    <component :is="mode" :crud="crud" />
  </CardWrapper>
</template>
