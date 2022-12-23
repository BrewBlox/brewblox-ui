<script lang="ts">
import { LEFT, UP } from '@/plugins/builder/const';
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';
import { flowOnCoord, liquidOnCoord } from '../utils';

const lowPaths = {
  borders: ['M 21,50 L 21,21 M 21,10 L 21,0', 'M 29,50 L 29,21 M 29,10 L 29,0'],
  liquid: 'M 25,50 L 25,21 M 25,11 L 25,0',
};
const highPaths = {
  borders: [
    `M50,29 H39 a7.69,7.69,0,0,1-6-3.46 l-1-1.9 A7.87,7.87,0,0,0,26,20
       H24 a7.87,7.87,0,0,0-6,3.63 l-1,1.82 A7.78,7.78,0,0,1,11,29 H0`,

    `M0,21 H6.5 a7.67,7.67,0,0,0,6-3.47 l1-1.9 a7.86,7.86,0,0,1,6-3.64 H30.62
       a7.87,7.87,0,0,1,6,3.63 l1,1.82 a7.78,7.78,0,0,0,6,3.55 H50`,
  ],
  liquid: `
        M50,25 H41.31 a7.69,7.69,0,0,1-6-3.46 l-1-1.73 a7.69,7.69,0,0,0-6-3.46
        H21.69 a7.69,7.69,0,0,0-6,3.46 l-1,1.73 a7.69,7.69,0,0,1-6,3.46 H0`,
};

export default defineComponent({
  name: 'BridgeTubePartComponent',
  setup() {
    const { part, width, height } = usePart.setup();

    const lowLiquid = computed<string[]>(() => liquidOnCoord(part.value, UP));

    const highLiquid = computed<string[]>(() =>
      liquidOnCoord(part.value, LEFT),
    );

    const lowFlowSpeed = computed<number>(() => flowOnCoord(part.value, UP));

    const highFlowSpeed = computed<number>(() => flowOnCoord(part.value, LEFT));

    return {
      width,
      height,
      lowPaths,
      highPaths,
      lowLiquid,
      highLiquid,
      lowFlowSpeed,
      highFlowSpeed,
    };
  },
});
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 50 50"
  >
    <!-- low -->
    <LiquidStroke
      :paths="[lowPaths.liquid]"
      :colors="lowLiquid"
    />
    <AnimatedArrows
      :speed="lowFlowSpeed"
      :path="lowPaths.liquid"
    />
    <g class="outline">
      <path
        v-for="border in lowPaths.borders"
        :key="border"
        :d="border"
      />
    </g>
    <!-- high -->
    <LiquidStroke
      :paths="[highPaths.liquid]"
      :colors="highLiquid"
    />
    <AnimatedArrows
      :speed="highFlowSpeed"
      :path="highPaths.liquid"
    />
    <g class="outline">
      <path
        v-for="border in highPaths.borders"
        :key="border"
        :d="border"
      />
    </g>
  </svg>
</template>
