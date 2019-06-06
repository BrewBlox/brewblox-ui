<script lang="ts">
import get from 'lodash/get';
import { Component } from 'vue-property-decorator';

import { Link } from '@/helpers/units';
import sparkStore from '@/plugins/spark/store';

import PartComponent from '../components/PartComponent';

@Component
export default class HeatingElement extends PartComponent {
  get paths() {
    return {
      fixture: [
        'M0,10l0,30h19v-7h-6.5c0,0,0,0,0,0c-4.1,0.1-7.4-3.2-7.5-7.2c0-4.7,2.8-7.8,7.5-7.8H19v-8H0z',
      ],
      borders: [
        'M50,24.7h24c7.1,0,6.6-6.7,14-6.7h126.9c0,0,7,0.1,7,7c0,7-7,7-7,7H90',
      ],
    };
  }

  get blockServiceId(): string {
    return this.part.settings.blockServiceId;
  }

  get blockLink(): Link {
    return this.part.settings.blockLink;
  }

  get blockValue(): number | null {
    if (!this.blockServiceId || !this.blockLink || !this.blockLink.id) {
      return null;
    }

    return get(
      sparkStore.blocks(this.blockServiceId),
      [this.blockLink.id, 'data', 'value'],
      null
    );
  }
}
</script>

<template>
  <g class="heating-element">
    <foreignObject
      :transform="textTransformation([1,1])"
      :width="SQUARE_SIZE"
      :height="SQUARE_SIZE"
    >
      <div class="text-white text-bold text-center">
        <q-icon name="mdi-gauge"/>
        <q-icon v-if="!blockLink" name="mdi-link-variant-off"/>
        <br>
        <span>{{ blockValue | round(0) }}%</span>
      </div>
    </foreignObject>
    <g class="outline">
      <path v-for="border in paths.borders" :key="border" :d="border"/>
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
