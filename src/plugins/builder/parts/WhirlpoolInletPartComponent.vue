<script lang="ts">
import { LEFT } from '@/plugins/builder/const';
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';
import { flowOnCoord, liquidOnCoord } from '../utils';

export default defineComponent({
  name: 'WhirlpoolInletPartComponent',
  setup() {
    const { part, flows, width, height } = usePart.setup();

    const flowSpeed = computed<number>(
      () => -flowOnCoord(part.value, flows.value, LEFT),
    );

    const liquids = computed<string[]>(() =>
      liquidOnCoord(part.value, flows.value, LEFT),
    );

    return {
      width,
      height,
      flowSpeed,
      liquids,
    };
  },
});
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 50 200"
  >
    <LiquidStroke
      :paths="['M0,25H20a5,5,0,0,1,5,5V175']"
      :colors="liquids"
      stroke-linecap="round"
    />
    <AnimatedArrows
      :speed="flowSpeed"
      :num-arrows="8"
      path="M0,25H20a5,5,0,0,1,5,5V175"
    />
    <g class="outline fill">
      <rect
        y="12"
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
      <path
        d="M0,21h20c5,0,9,4,9,9v144.1c0,0,0.1,4.9-4,4.9
          c-4.3,0-4-4.9-4-4.9V32c0-1.7-1.3-3-3-3H0"
      />
      <path
        d="M25,178.5L25,178.5c-1.1,0-2-0.9-2-2v-12c0-1.1,0.9-2,2-2l0,0
          c1.1,0,2,0.9,2,2v12C27,177.6,26.1,178.5,25,178.5z"
      />
    </g>
  </svg>
</template>
