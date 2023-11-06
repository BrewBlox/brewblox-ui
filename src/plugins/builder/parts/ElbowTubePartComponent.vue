<script setup lang="ts">
import { usePart } from '../composables';
import { RIGHT } from '@/plugins/builder/const';
import { elbow, flowOnCoord, liquidOnCoord } from '@/plugins/builder/utils';
import { computed } from 'vue';

const paths = {
  borders: [
    `M21,0 v17 ${elbow(12, 12, false)} H50`,
    `M29,0 v17 ${elbow(4, 4, false)} H50`,
  ],
  liquid: [`M25,0 v17 ${elbow(8, 8, false)} H50`],
};

const { part, flows, width, height } = usePart.setup();

const flowSpeed = computed<number>(() =>
  flowOnCoord(part.value, flows.value, RIGHT),
);

const liquids = computed<string[]>(() =>
  liquidOnCoord(part.value, flows.value, RIGHT),
);
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 50 50"
  >
    <LiquidStroke
      :paths="paths.liquid"
      :colors="liquids"
    />
    <AnimatedArrows
      :speed="flowSpeed"
      :path="paths.liquid[0]"
    />
    <g class="outline">
      <path :d="paths.borders[0]" />
      <path :d="paths.borders[1]" />
    </g>
  </svg>
</template>
