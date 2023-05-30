<script setup lang="ts">
import { Coordinates } from '@/utils/coordinates';
import { computed, PropType } from 'vue';
import { BuilderPart } from '../types';
import { coord2grid } from '../utils';

const props = defineProps({
  parts: {
    type: Object as PropType<BuilderPart[]>,
    required: true,
  },
});

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

<style lang="sass" scoped>
.grid-square-text
  font-size: x-small
  z-index: 2
  -webkit-user-select: none
  -moz-user-select: none
  -ms-user-select: none
  user-select: none
</style>
