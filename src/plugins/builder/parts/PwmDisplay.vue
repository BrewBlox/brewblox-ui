<script lang="ts">
import { Component } from 'vue-property-decorator';

import { ActuatorPwmBlock } from '@/plugins/spark/features/ActuatorPwm/types';

import PartBase from '../components/PartBase';
import { settingsBlock } from '../helpers';


@Component
export default class PwmDisplay extends PartBase {
  get block(): ActuatorPwmBlock | null {
    return settingsBlock(this.part, 'pwm');
  }

  get pwmSetting(): number | null {
    return this.block
      ? this.block.data.desiredSetting
      : null;
  }
}
</script>
<template>
  <g>
    <foreignObject
      :transform="textTransformation([1,1])"
      :width="SQUARE_SIZE"
      :height="SQUARE_SIZE"
    >
      <div class="text-white text-bold text-center">
        <q-icon name="mdi-gauge" class="q-mr-xs" />
        <q-icon v-if="!block" name="mdi-link-variant-off" />
        <small v-else>%</small>
        <br />
        {{ pwmSetting | round(0) }}
      </div>
    </foreignObject>
    <g class="outline">
      <rect
        :width="SQUARE_SIZE-2"
        :height="SQUARE_SIZE-2"
        x="1"
        y="1"
        rx="6"
        ry="6"
        stroke-width="2px"
      />
    </g>
  </g>
</template>
