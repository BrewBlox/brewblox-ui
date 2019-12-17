<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import ActuatorAnalogMockBasic from './ActuatorAnalogMockBasic.vue';
import ActuatorAnalogMockFull from './ActuatorAnalogMockFull.vue';
import { ActuatorAnalogMockBlock } from './types';

@Component({
  components: {
    Basic: ActuatorAnalogMockBasic,
    Full: ActuatorAnalogMockFull,
  },
})
export default class ActuatorAnalogMockWidget
  extends BlockWidgetBase<ActuatorAnalogMockBlock> {
}
</script>

<template>
  <component :is="mode" :crud="crud" :class="cardClass">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
    </template>
  </component>
</template>
