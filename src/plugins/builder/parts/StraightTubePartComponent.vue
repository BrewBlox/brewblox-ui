<script setup lang="ts">
import { RIGHT } from '@/plugins/builder/const';
import { computed } from 'vue';
import { usePart } from '../composables';
import { flowOnCoord, liquidOnCoord } from '../utils';

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
      :paths="['M 0,25 H 50']"
      :colors="liquids"
    />
    <AnimatedArrows
      :speed="flowSpeed"
      path="M0,25H50"
    />
    <g class="outline">
      <path d="M 0,21 H 50" />
      <path d="M 0,29 H 50" />
    </g>
  </svg>
</template>
