<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';

import { DigitalActuatorBlock } from '@/plugins/spark/features/DigitalActuator/types';
import { DigitalState } from '@/plugins/spark/types';

import PartBase from '../components/PartBase';
import { LEFT } from '../getters';
import { settingsBlock } from '../helpers';

@Component
export default class Pump extends PartBase {

  get actuatorBlock(): DigitalActuatorBlock | null {
    return settingsBlock(this.part, 'actuator');
  }

  get enabled() {
    return !!this.actuatorBlock
      ? Boolean(this.actuatorBlock.data.state === DigitalState.Active)
      : Boolean(this.settings.enabled);
  }

  get liquids() {
    return this.liquidOnCoord(LEFT);
  }

  get powerIcon() {
    return `
        M27.7,9.5c-0.7,1.1-1.4,2.2-2.3,3.2c-0.4,0.5-0.8,1-1.2,1.5
        s-0.9,1-1.3,1.4L22.3,14c1.8-0.1,3.6-0.1,5.5,0l2.4,0.1l-1.7,1.5
        c-0.5,0.4-1,0.9-1.4,1.3s-1,0.8-1.5,1.2c-1,0.8-2.1,1.6-3.2,2.3
        c0.7-1.1,1.5-2.2,2.3-3.2c0.4-0.5,0.8-1,1.2-1.5
        c0.4-0.5,0.9-1,1.3-1.4l0.7,1.6c-1.8,0.1-3.6,0.1-5.5,0l-2.3-0.1
        l1.7-1.5c0.5-0.4,1-0.9,1.5-1.3c0.5-0.4,1-0.8,1.5-1.3
        C25.6,10.9,26.6,10.2,27.7,9.5z`;
  }

  @Watch('actuatorBlock')
  triggerUpdate(block, prevBlock) {
    if (block === null
      || prevBlock === null
      || block.data.state !== prevBlock.data.state) {
      this.invalidateFlows();
    }
  }
}
</script>

<template>
  <g>
    <!-- tube liquid bottom-->
    <LiquidStroke :paths="['M50,25H0']" :colors="liquids" />
    <!-- ball liquid -->
    <LiquidStroke :paths="['M 17 29 A 8 8 0 1 1 17 31 Z']" :colors="liquids" class="ballLiquid" />
    <!-- ball outline-->
    <circle cx="25" cy="30" r="16" class="outline" />
    <!-- blades -->
    <g class="blades-wrapper" transform="translate(25,30)">
      <g class="outline">
        <line x1="-14" y1="0" x2="14" y2="0" />
        <line x1="7" y1="-12.1" x2="-7" y2="12.1" />
        <line x1="7" y1="12.1" x2="-7" y2="-12.1" />
        <!-- eslint-disable vue/attribute-hyphenation -->
        <animateTransform
          v-if="enabled"
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from="0 0 0"
          to="-360 0 0"
          dur="2s"
          repeatCount="indefinite"
        />
        <!-- eslint-enable -->
      </g>
    </g>
    <!-- tube liquid top-->
    <LiquidStroke :paths="['M50,25H25V36']" :colors="liquids" />
    <!-- tubes -->
    <g class="outline">
      <polyline points="20.5,10 16.5,6 20.5,2 " />
      <line x1="32.5" y1="6" x2="16.5" y2="6" />
      <line x1="0" y1="21" x2="11" y2="21" />
      <line x1="0" y1="29" x2="9" y2="29" />
      <path d="M50,29H29v3.5c0,2.2-1.8,4-4,4s-4-1.8-4-4V25c0-2.2,1.8-4,4-4h25" />
    </g>
    <rect fill="green" fill-opacity="0" x="0" y="0" width="50" height="50" />
    <!-- Power Icon -->
    <g class="power-icon">
      <path v-if="actuatorBlock" :d="powerIcon" transform="translate(15,-5)" />
    </g>
  </g>
</template>

<style lang="stylus" scoped>
/deep/ .ballLiquid path {
  stroke-width: 15px !important;
}

/deep/ .power-icon path {
  stroke-width: 1px;
  stroke: white;
  fill: white;
}
</style>
