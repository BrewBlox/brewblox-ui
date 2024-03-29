<script setup lang="ts">
import { computed } from 'vue';
import { COIL_BOTTOM } from '../blueprints/Coil';
import { usePart } from '../composables';
import { flowOnCoord, liquidOnCoord } from '../utils';

const paths = {
  borders: [
    'M 103.9,30.8 L 94.8,30 c -22.2-1-49.5-1-49.8-1 H 1',
    'M 1,21 h 45 c 0.3,0,27.9,0,50.2,1 l 50.2,4.6',
    'M 86.4,40.6 l 59,5.4',
    'M 103.7,50.2 l -59.1-5.4',
    'M 86.4,60 l 59,5.4',
    'M 101,69.5 l -56.4-5.2',

    `M 41,60.7 c -0.1-1,0.2-2.1,0.9-2.9 c 0.7-0.9,1.6-1.4,2.7-1.5
      l 100-10.3 c 0.1,0,0.3,0,0.4,0 c 2.1,0,3.8,1.6,4,3.6
      c 0.2,2.2-1.4,4.2-3.6,4.4 l -100,10.3 c -0.1,0-0.3,0-0.4,0
      C 42.9,64.3,41.2,62.7,41,60.7 z`,

    `M 41,41.3 c -0.2-2.2,1.4-4.2,3.6-4.4 l 100-10.3 c 0.1,0,0.3,0,0.4,0
      c 2.1,0,3.8,1.6,4,3.6 c 0.2,2.2-1.4,4.2-3.6,4.4 l -100,10.3
      c -0.1,0-0.3,0-0.4,0 C 42.9,44.9,41.2,43.3,41,41.3 z`,

    `M 1,71.1 h 45 c 0.3,0,27.6,0,49.7-1 l 48.9,-4.6 c 0.1,0,0.3,0,0.4,0
      c 2.1,0,3.8,1.5,4,3.6 c 0.2,2.1-1.4,4.1-3.6,4.3 l-50,4.6
      c -0.1,0-0.1,0-0.2,0 c -22.4,1-49.9,1-50.2,1 H 1`,
  ],
  frontLiquid: ['M 45.4,60.3 L 145.4,50', 'M 45.4,40.9 L 145.4,30.6'],
  backLiquid: ['M 145.4,50 L 45.4,40.9', 'M 145.4,69.4 L 45.4,60.3'],
  ioLiquid: [
    'M 145.4,30.6 l -50-4.6 c -22.5-1-50-1-50-1 H 0',
    'M 0,75 h 45.4 c 0,0,27.5,0,50-1 l 50-4.6',
  ],
};

const { part, flows, width, height } = usePart.setup();

const flowSpeed = computed<number>(() =>
  flowOnCoord(part.value, flows.value, COIL_BOTTOM),
);

const liquids = computed<string[]>(() =>
  liquidOnCoord(part.value, flows.value, COIL_BOTTOM),
);
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 150 100"
  >
    <LiquidStroke
      :paths="paths.backLiquid"
      :colors="liquids"
      stroke-linecap="round"
    />
    <AnimatedArrows
      :speed="-flowSpeed"
      :path="paths.backLiquid[0]"
      :num-arrows="3"
    />
    <AnimatedArrows
      :speed="-flowSpeed"
      :path="paths.backLiquid[1]"
      :num-arrows="3"
    />
    <LiquidStroke
      :paths="paths.ioLiquid"
      :colors="liquids"
      stroke-linecap="round"
    />
    <AnimatedArrows
      :speed="-flowSpeed"
      :path="paths.ioLiquid[0]"
      :num-arrows="5"
    />
    <AnimatedArrows
      :speed="-flowSpeed"
      :path="paths.ioLiquid[1]"
      :num-arrows="5"
    />
    <LiquidStroke
      :paths="paths.frontLiquid"
      :colors="liquids"
      stroke-linecap="round"
    />
    <AnimatedArrows
      :speed="-flowSpeed"
      :path="paths.frontLiquid[0]"
      :num-arrows="4"
    />
    <AnimatedArrows
      :speed="-flowSpeed"
      :path="paths.frontLiquid[1]"
      :num-arrows="4"
    />
    <g class="outline fill">
      <rect
        x="1"
        y="12.5"
        width="8"
        height="8"
      />
      <rect
        x="1"
        y="30"
        width="8"
        height="8"
      />
      <rect
        x="1"
        y="62.5"
        width="8"
        height="8"
      />
      <rect
        x="1"
        y="80"
        width="8"
        height="8"
      />
    </g>
    <g class="outline">
      <path
        v-for="border in paths.borders"
        :key="border"
        :d="border"
      />
    </g>
  </svg>
</template>
