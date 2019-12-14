<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import DigitalActuatorBasic from './DigitalActuatorBasic.vue';
import DigitalActuatorFull from './DigitalActuatorFull.vue';
import { DigitalActuatorBlock } from './types';

@Component({
  components: {
    Basic: DigitalActuatorBasic,
    Full: DigitalActuatorFull,
  },
})
export default class DigitalActuatorWidget
  extends BlockWidgetBase<DigitalActuatorBlock> {
}
</script>

<template>
  <GraphCardWrapper :show="inDialog">
    <template #graph>
      <HistoryGraph :graph-id="widget.id" :config="graphCfg" :refresh-trigger="mode" />
    </template>

    <component :is="mode" :crud="crud" :class="cardClass">
      <template #toolbar>
        <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
      </template>
      <template #warnings>
        <CardWarning v-if="!block.data.hwDevice.id || !block.data.channel">
          <template #message>
            <span>Digital Actuator has no channel selected.</span>
          </template>
        </CardWarning>
      </template>
    </component>
  </GraphCardWrapper>
</template>
