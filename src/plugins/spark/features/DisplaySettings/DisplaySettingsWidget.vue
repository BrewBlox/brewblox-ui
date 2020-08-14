<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';
import { DisplaySettingsBlock } from '@/plugins/spark/types';

import DisplaySettingsBasic from './DisplaySettingsBasic.vue';
import DisplaySettingsFull from './DisplaySettingsFull.vue';

@Component({
  components: {
    Basic: DisplaySettingsBasic,
    Full: DisplaySettingsFull,
  },
})
export default class DisplaySettingsWidget
  extends BlockWidgetBase<DisplaySettingsBlock> {

  clearSlots(): void {
    this.block.data.widgets = [];
    this.saveBlock();
  }
}
</script>

<template>
  <CardWrapper
    v-bind="{context}"
    @dblclick="toggleMode"
  >
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode">
        <template #actions>
          <ActionItem icon="clear" label="Clear slots" @click="clearSlots" />
        </template>
      </component>
    </template>

    <component :is="mode" :crud="crud" />
  </CardWrapper>
</template>
