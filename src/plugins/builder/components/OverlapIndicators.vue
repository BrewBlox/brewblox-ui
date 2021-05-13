<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { Coordinates } from '@/utils/coordinates';

import { FlowPart } from '../types';
import { squares } from '../utils';


export default defineComponent({
  name: 'OverlapIndicators',
  props: {
    parts: {
      type: Array as PropType<FlowPart[]>,
      required: true,
    },
  },
  setup(props) {

    const overlaps = computed<[Coordinates, number][]>(
      () => {
        const counts: Mapped<number> = {};
        for (const part of props.parts) {
          const key = new Coordinates([part.x, part.y, 0]).toString();
          counts[key] = (counts[key] || 0) + 1;
        }
        return Object.entries(counts)
          .filter(([, v]) => v > 1)
          .map(([k, v]) => [new Coordinates(k), v] as [Coordinates, number]);
      },
    );

    return {
      squares,
      overlaps,
    };
  },
});
</script>

<template>
  <g
    v-for="([coord, val], idx) in overlaps"
    :key="idx"
    :transform="`translate(${squares(coord.x) + 40}, ${squares(coord.y) + 4})`"
  >
    <circle r="8" fill="dodgerblue" />
    <text
      y="4"
      text-anchor="middle"
      fill="white"
      class="grid-square-text"
    >
      {{ val }}
    </text>
  </g>
</template>
