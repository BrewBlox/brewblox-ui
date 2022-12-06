<script lang="ts">
import { Coordinates } from '@/utils/coordinates';
import { computed, defineComponent, PropType } from 'vue';
import { FlowPart } from '../types';
import { coord2grid } from '../utils';

export default defineComponent({
  name: 'OverlapIndicators',
  props: {
    parts: {
      type: Array as PropType<FlowPart[]>,
      required: true,
    },
  },
  setup(props) {
    const overlaps = computed<[x: number, y: number, depth: number][]>(() => {
      const counts: Mapped<number> = {};
      for (const part of props.parts) {
        const key = new Coordinates([part.x, part.y, 0]).toString();
        counts[key] = (counts[key] || 0) + 1;
      }
      return Object.entries(counts)
        .filter(([, depth]) => depth > 1)
        .map(([k, depth]) => {
          const coord = new Coordinates(k);
          return [coord2grid(coord.x), coord2grid(coord.y), depth];
        });
    });

    return {
      coord2grid,
      overlaps,
    };
  },
});
</script>

<template>
  <g
    v-for="([x, y, depth], idx) in overlaps"
    :key="idx"
    :transform="`translate(${x + 40}, ${y + 4})`"
  >
    <circle
      r="8"
      fill="dodgerblue"
    />
    <text
      y="4"
      text-anchor="middle"
      fill="white"
      class="grid-square-text"
    >
      {{ depth }}
    </text>
  </g>
</template>
