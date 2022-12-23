<script lang="ts">
import { RIGHT } from '@/plugins/builder/const';
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';
import { flowOnCoord, liquidOnCoord } from '../utils';

export default defineComponent({
  name: 'GravityTubePartComponent',
  setup() {
    const { part, width, height } = usePart.setup();

    const flowSpeed = computed<number>(() => flowOnCoord(part.value, RIGHT));

    const liquids = computed<string[]>(() => liquidOnCoord(part.value, RIGHT));

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
    viewBox="0 0 50 50"
  >
    <g class="outline">
      <path d="M 0,21 H 50" />
      <path d="M 0,29 H 50" />
      <!-- Arrow -->
      <polyline points="20.5,10 16.5,6 20.5,2 " />
      <line
        x1="32.5"
        y1="6"
        x2="16.5"
        y2="6"
      />
      <line
        x1="0"
        y1="21"
        x2="11"
        y2="21"
      />
      <line
        x1="0"
        y1="29"
        x2="9"
        y2="29"
      />
    </g>
    <LiquidStroke
      :paths="['M 0,25 H 50']"
      :colors="liquids"
    />
    <AnimatedArrows
      :speed="flowSpeed"
      path="M0,25H50"
    />
  </svg>
</template>
