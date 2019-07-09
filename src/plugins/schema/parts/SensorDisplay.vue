<script lang="ts">
import get from 'lodash/get';
import { Component } from 'vue-property-decorator';

import { Block } from '@/plugins/spark/types';

import PartComponent from '../components/PartComponent';
import { settingsBlock } from '../helpers';


@Component
export default class SensorDisplay extends PartComponent {
  get block(): Block | null {
    return settingsBlock(this.part, 'sensor');
  }

  get temperature(): number | null {
    return get(this, 'block.data.value.val', null);
  }

  get tempUnit(): string {
    return get(this, 'block.data.value.notation', '');
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
        <q-icon name="mdi-thermometer"/>
        <q-icon v-if="!block" name="mdi-link-variant-off"/>
        <small v-else>{{ tempUnit }}</small>
        <br>
        {{ temperature | round(1) }}
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
