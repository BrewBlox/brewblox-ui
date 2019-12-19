<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';

import { DigitalActuatorBlock } from '@/plugins/spark/features/DigitalActuator/types';
import { DigitalState } from '@/plugins/spark/types';

import PartBase from '../components/PartBase';
import { DEFAULT_PUMP_PRESSURE, LEFT } from '../getters';
import { settingsBlock } from '../helpers';

@Component
export default class Pump extends PartBase {
  get actuatorBlock(): DigitalActuatorBlock | null {
    return settingsBlock(this.part, 'actuator');
  }

  get enabled(): boolean {
    return !!this.actuatorBlock
      ? Boolean(this.actuatorBlock.data.state === DigitalState.Active)
      : Boolean(this.settings.enabled);
  }

  get liquids(): string[] {
    return this.liquidOnCoord(LEFT);
  }

  get duration(): number {
    const calculated = 60 / (this.settings.onPressure || DEFAULT_PUMP_PRESSURE);
    return Math.max(calculated, 0.5); // Max out animation speed at 120 pressure
  }

  @Watch('actuatorBlock')
  triggerUpdate(block, prevBlock): void {
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
          :dur="`${duration}s`"
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
    <PowerIcon v-if="actuatorBlock" transform="translate(15,-5)" />
  </g>
</template>

<style lang="scss" scoped>
/deep/ .ballLiquid path {
  stroke-width: 15px !important;
}
</style>
