<script setup lang="ts">
import { LEFT, RIGHT, UP } from '@/plugins/builder/const';
import { computed } from 'vue';
import { usePart } from '../composables';
import { flowOnCoord, liquidOnCoord } from '../utils';

const { part, flows, width, height } = usePart.setup();

const topSpeed = computed<number>(() =>
  flowOnCoord(part.value, flows.value, UP),
);

const leftSpeed = computed<number>(() =>
  flowOnCoord(part.value, flows.value, LEFT),
);

const rightSpeed = computed<number>(() =>
  flowOnCoord(part.value, flows.value, RIGHT),
);

const topLiquids = computed<string[]>(() =>
  liquidOnCoord(part.value, flows.value, UP),
);

const leftLiquids = computed<string[]>(() =>
  liquidOnCoord(part.value, flows.value, LEFT),
);

const rightLiquids = computed<string[]>(() =>
  liquidOnCoord(part.value, flows.value, RIGHT),
);
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 50 50"
  >
    <LiquidStroke
      :paths="['M25,25V0']"
      :colors="topLiquids"
      stroke-linecap="round"
    />
    <LiquidStroke
      :paths="['M0,25H25']"
      :colors="leftLiquids"
      stroke-linecap="round"
    />
    <LiquidStroke
      :paths="['M25,25H50']"
      :colors="rightLiquids"
      stroke-linecap="round"
    />
    <g class="outline">
      <path d="M0,21H21V0" />
      <path d="M50,21H29V0" />
      <path d="M0,29H50" />
      <AnimatedArrows
        :num-arrows="1"
        :speed="topSpeed"
        path="M25,25 V0"
      />
      <AnimatedArrows
        :num-arrows="1"
        :speed="leftSpeed"
        path="M25,25 H0"
      />
      <AnimatedArrows
        :num-arrows="1"
        :speed="rightSpeed"
        path="M25,25 H50"
      />
    </g>
  </svg>
</template>
