<script setup lang="ts">
import { computed } from 'vue';
import { LEFT } from '@/plugins/builder/const';
import { usePart } from '../composables';
import { flowOnCoord, liquidOnCoord } from '../utils';

const { part, flows, width, height } = usePart.setup();

const flowSpeed = computed<number>(
  () => -flowOnCoord(part.value, flows.value, LEFT),
);

const liquids = computed<string[]>(() =>
  liquidOnCoord(part.value, flows.value, LEFT),
);
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 50 50"
  >
    <LiquidStroke
      :paths="['M0,25 H25']"
      :colors="liquids"
    />
    <AnimatedArrows
      :num-arrows="1"
      :speed="flowSpeed"
      path="M0,25 H25"
    />
    <g class="outline fill">
      <rect
        y="12.5"
        width="8"
        height="8"
      />
      <rect
        y="30"
        width="8"
        height="8"
      />
    </g>
    <g class="outline">
      <path d="M 0,21 L 25,21" />
      <path d="M 0,29 L 25,29" />
    </g>
  </svg>
</template>
