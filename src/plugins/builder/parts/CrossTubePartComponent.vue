<script setup lang="ts">
import { usePart } from '../composables';
import { flowOnCoord, liquidOnCoord } from '../utils';
import { DOWN, LEFT, RIGHT, UP } from '@/plugins/builder/const';
import { computed } from 'vue';

type Direction = 'up' | 'down' | 'left' | 'right';
const paths = {
  up: 'M25,25 V0',
  down: 'M25,25 V50',
  left: 'M25,25 H0',
  right: 'M25,25 H50',
};

const { part, flows, width, height } = usePart.setup();

const speed = computed<Record<Direction, number>>(() => ({
  up: flowOnCoord(part.value, flows.value, UP),
  down: flowOnCoord(part.value, flows.value, DOWN),
  left: flowOnCoord(part.value, flows.value, LEFT),
  right: flowOnCoord(part.value, flows.value, RIGHT),
}));

const liquids = computed<Record<Direction, string[]>>(() => ({
  up: liquidOnCoord(part.value, flows.value, UP),
  down: liquidOnCoord(part.value, flows.value, DOWN),
  left: liquidOnCoord(part.value, flows.value, LEFT),
  right: liquidOnCoord(part.value, flows.value, RIGHT),
}));
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 50 50"
  >
    <g class="outline">
      <polyline points="50,21 29,21 29,0" />
      <polyline points="21,0 21,21 0,21" />
      <polyline points="0,29 21,29 21,50" />
      <polyline points="29,50 29,29 50,29" />
    </g>
    <LiquidStroke
      :paths="[paths.up]"
      :colors="liquids.up"
    />
    <LiquidStroke
      :paths="[paths.down]"
      :colors="liquids.down"
    />
    <LiquidStroke
      :paths="[paths.left]"
      :colors="liquids.left"
    />
    <LiquidStroke
      :paths="[paths.right]"
      :colors="liquids.right"
    />
    <g class="outline">
      <AnimatedArrows
        :path="paths.up"
        :num-arrows="1"
        :speed="speed.up"
      />
      <AnimatedArrows
        :path="paths.down"
        :num-arrows="1"
        :speed="speed.down"
      />
      <AnimatedArrows
        :path="paths.left"
        :num-arrows="1"
        :speed="speed.left"
      />
      <AnimatedArrows
        :path="paths.right"
        :num-arrows="1"
        :speed="speed.right"
      />
    </g>
  </svg>
</template>
