<script lang="ts">
import get from 'lodash/get';
import { Component } from 'vue-property-decorator';

import { Block } from '@/plugins/spark/types';

import PartBase from '../components/PartBase';
import { COLD_WATER, HOT_WATER } from '../getters';
import { settingsBlock } from '../helpers';


@Component
export default class PidDisplay extends PartBase {
  HOT_WATER = HOT_WATER;
  COLD_WATER = COLD_WATER;

  get block(): Block | null {
    return settingsBlock(this.part, 'pid');
  }

  get outputValue(): number | null {
    return get(this, 'block.data.outputValue', null);
  }

  get kp() {
    return get(this, 'block.data.kp.value', 0);
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
        <svg>
          <HeatingIcon v-if="kp > 0" :stroke="HOT_WATER" x="10" />
          <CoolingIcon v-else-if="kp < 0" :stroke="COLD_WATER" x="10" />
        </svg>
        <q-space />
        <q-icon v-if="kp === 0" name="mdi-calculator-variant" class="q-mr-xs" />
        <q-icon v-if="!block" name="mdi-link-variant-off" />
        <br >
        {{ outputValue | round(0) }}
        <small v-if="!!block">%</small>
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
