<script lang="ts">
import { RIGHT } from '@/plugins/builder/const';
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';
import { flowOnCoord, liquidOnCoord } from '../utils';

const paths = {
  borders: ['M 0,21 H 50', 'M 0,29 H 50'],
  liquid: 'M 0,25 H 50',
};

export default defineComponent({
  name: 'StraightTubePartComponent',
  setup() {
    const { part, width, height } = usePart.setup();

    const flowSpeed = computed<number>(() => flowOnCoord(part.value, RIGHT));

    const liquids = computed<string[]>(() => liquidOnCoord(part.value, RIGHT));

    return {
      width,
      height,
      paths,
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
    <LiquidStroke
      :paths="[paths.liquid]"
      :colors="liquids"
    />
    <AnimatedArrows
      :speed="flowSpeed"
      path="M0,25H50"
    />
    <g class="outline">
      <path :d="paths.borders[0]" />
      <path :d="paths.borders[1]" />
    </g>
  </svg>
</template>
