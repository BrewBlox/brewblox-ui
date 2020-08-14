<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';
import { ActuatorAnalogMockBlock } from '@/plugins/spark/types';

import ActuatorAnalogMockBasic from './ActuatorAnalogMockBasic.vue';
import ActuatorAnalogMockFull from './ActuatorAnalogMockFull.vue';

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
  <CardWrapper
    v-bind="{context}"
    @dblclick.native="toggleMode"
  >
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
    </template>
    <component :is="mode" :crud="crud" />
  </CardWrapper>
</template>
