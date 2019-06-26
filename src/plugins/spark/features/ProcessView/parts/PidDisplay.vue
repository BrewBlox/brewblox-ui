<script lang="ts">
import get from 'lodash/get';
import { Component } from 'vue-property-decorator';

import { Block } from '@/plugins/spark/types';

import PartComponent from '../components/PartComponent';
import { settingsBlock } from '../helpers';


@Component
export default class PidDisplay extends PartComponent {
  get block(): Block | null {
    return settingsBlock(this.part, 'pid');
  }

  get outputSetting(): number | null {
    return get(this, 'block.data.outputSetting', null);
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
        <q-icon name="mdi-calculator-variant" class="q-mr-xs"/>
        <q-icon v-if="!block" name="mdi-link-variant-off"/>
        <small v-else>%</small>
        <br>
        {{ outputSetting | round(0) }}
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
