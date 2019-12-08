<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import DS2408Basic from './DS2408Basic.vue';
import DS2408Full from './DS2408Full.vue';
import { DS2408Block } from './types';

@Component({
  components: {
    Basic: DS2408Basic,
    Full: DS2408Full,
  },
})
export default class DS2408Widget
  extends BlockWidgetBase<DS2408Block> {
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
          DS2408 is not connected
        </template>
      </CardWarning>
    </template>
  </component>
</template>
