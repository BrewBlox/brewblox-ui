<script setup lang="ts">
import { computed } from 'vue';
import { RIGHT } from '@/plugins/builder/const';
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
    <g
      key="valve-outer"
      class="outline"
    >
      <path
        d="M0,21h10.5c1.4-5.1,5.4-9.1,10.5-10.5C29,8.3,37.2,13,39.4,21h0.1H50"
      />
      <path
        d="M0,29h10.5h0C12.7,37,21,41.6,29,39.4C34,38,38,34,39.4,29h0.1H50"
      />
    </g>
    <LiquidStroke
      :paths="['M 0,25 h 50', 'M 20,15 L 30,25 L 20,35']"
      :colors="liquids"
    />
    <g class="fill">
      <path
        d="M22.81,22l-2.38-2.38a3,3,0,0,1,4.24-4.24L31.3,22h8.4a15,15,0,0,0-29.4,0H22.81Z"
      />
      <path
        d="M31.3,28l-6.62,6.62a3,3,0,0,1-4.24-4.24L22.81,28H10.3a15,15,0,0,0,29.4,0H31.3Z"
      />
    </g>
    <AnimatedArrows
      :speed="flowSpeed"
      path="M0,25H50"
    />
  </svg>
</template>
