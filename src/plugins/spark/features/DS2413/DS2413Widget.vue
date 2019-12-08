<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import DS2413Basic from './DS2413Basic.vue';
import DS2413Full from './DS2413Full.vue';
import { DS2413Block } from './types';

@Component({
  components: {
    Basic: DS2413Basic,
    Full: DS2413Full,
  },
})
export default class DS2413Widget
  extends BlockWidgetBase<DS2413Block> {
}
</script>

<template>
  <component :is="mode" :crud="crud" :class="cardClass">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
    </template>
    <template #warnings>
      <CardWarning v-if="!block.data.connected">
        <template #message>
          DS2413 is not connected
        </template>
      </CardWarning>
    </template>
  </component>
</template>
