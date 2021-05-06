<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { CFC_BOTTOM_LEFT, CFC_TOP_RIGHT } from '../specs/CounterflowChiller';
import { FlowPart } from '../types';
import { flowOnCoord, liquidOnCoord } from '../utils';

const paths = {
  borders: [
    'M0,21h5.3c2.9,0,6.9,2.2,8.8,4.8l2.7,3.6c2,2.6,4.6,4.8,5.8,4.8h2.3',
    'M0,29h2.8c1.5,0,4.4,2.2,6.3,4.8l2.7,3.6c2,2.6,5.9,4.8,8.8,4.8h5.3',
    'M150,21h-5.3c-2.9,0-6.9,2.2-8.8,4.8l-2.7,3.6c-2,2.6-4.6,4.8-5.8,4.8h-2.3',
    'M150,29h-2.8c-1.5,0-4.4,2.2-6.3,4.8l-2.7,3.6c-2,2.6-5.9,4.8-8.8,4.8h-5.3',
    'M25.9,57.8h-5.8c-3.6,0.2-7,2-9.3,4.8l-2.7,3.6c-2,2.6-4.6,4.8-5.8,4.8H0',
    'M24.9,65.8h-2.8c-1.5,0-4.4,2.2-6.3,4.8l-2.7,3.6c-2,2.6-5.7,4.8-8.3,4.8H0',
    'M124.2,57.8h5.8c3.6,0.2,7,2,9.3,4.8l2.7,3.6c2,2.6,4.6,4.8,5.8,4.8h2.2',
    'M125.2,65.8h2.8c1.5,0,4.4,2.2,6.3,4.8l2.7,3.6c2,2.6,5.7,4.8,8.3,4.8h4.7',

    `M37.5,25h75c6.9,0,12.5,5.6,12.5,12.5l0,0c0,6.9-5.6,12.5-12.5,12.5h-75
       C30.6,50,25,44.4,25,37.5 l0,0C25,30.6,30.6,25,37.5,25z`,

    `M37.5,50h75c6.9,0,12.5,5.6,12.5,12.5l0,0c0,6.9-5.6,12.5-12.5,12.5h-75
       C30.6,75,25,69.4,25,62.5 l0,0C25,55.6,30.6,50,37.5,50z`,
  ],
  topTubeLiquid: [
    'M 0,25 h 4.1 c 2.2,0,5.7,2.2,7.6,4.8 l 2.7,3.6 c 2,2.6,5.1,4.8,7,4.8 h 4.5',
    'M 150,25 H 146 c -2.2,0-5.7,2.2-7.6,4.8 l -2.7,3.6 c -2,2.6-5.1,4.8-7,4.8 h -4.5',
  ],
  topBulbLiquid: [
    'M 36.8,37.5 L 113.3,37.5',
  ],
  bottomTubeLiquid: [
    'M 25.9,61.8 h-5.1 c -2.2,0-5.7,2.2-7.6,4.8 l -2.7,3.6 c -2,2.6-5.1,4.8-7,4.8 H 0',
    'M 124.2,61.8 h 5.1 c 2.2,0,5.7,2.2,7.6,4.8 l 2.7,3.6 c 2,2.6,5.1,4.8,7,4.8 h 3.5',
  ],
  bottomBulbLiquid: [
    'M 36.8,62.5 L 113.3,62.5',
  ],
  topArrows: `
      M 0,25 h 4.1 c 2.2,0,5.7,2.2,7.6,4.8 l 2.7,3.6 c 2,2.6,5.1,4.8,7,4.8 h 4.5
      L 124.2,38.1 L 128.7,38.2 C 130.6,38.2 133.7,36.0 135.7,33.4 L 138.4,29.8
      C 140.3,27.2 143.8,25.0 146.0,25.0 L 150.0,25.0
      `,
  bottomArrows: `
      M 150.1,75 L 146.6,75 C 144.7,75 141.6,72.8 139.6,70.2 L 136.9,66.6
      C 135.0,64.0 131.5,61.8 129.3,61.8 L 124.2,61.8
      L 25.9,61.8 h-5.1 c -2.2,0-5.7,2.2-7.6,4.8 l -2.7,3.6 c -2,2.6-5.1,4.8-7,4.8 H 0
      `,
};

export default defineComponent({
  name: 'CounterflowChiller',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const topFlowSpeed = computed<number>(
      () => flowOnCoord(props.part, CFC_TOP_RIGHT),
    );

    const bottomFlowSpeed = computed<number>(
      () => flowOnCoord(props.part, CFC_BOTTOM_LEFT),
    );

    const topLiquids = computed<string[]>(
      () => liquidOnCoord(props.part, CFC_TOP_RIGHT),
    );

    const bottomLiquids = computed<string[]>(
      () => liquidOnCoord(props.part, CFC_BOTTOM_LEFT),
    );

    return {
      paths,
      topFlowSpeed,
      bottomFlowSpeed,
      topLiquids,
      bottomLiquids,
    };
  },
});
</script>

<template>
  <g>
    <LiquidStroke :paths="paths.topBulbLiquid" :colors="topLiquids" class="bulbLiquid" />
    <LiquidStroke :paths="paths.bottomBulbLiquid" :colors="bottomLiquids" class="bulbLiquid" />
    <g class="outline">
      <path v-for="border in paths.borders" :key="border" :d="border" />
    </g>
    <LiquidStroke :paths="paths.topTubeLiquid" :colors="topLiquids" />
    <LiquidStroke :paths="paths.bottomTubeLiquid" :colors="bottomLiquids" />
    <AnimatedArrows :speed="topFlowSpeed" :path="paths.topArrows" :num-arrows="5" />
    <AnimatedArrows :speed="bottomFlowSpeed" :path="paths.bottomArrows" :num-arrows="5" />
  </g>
</template>

<style lang="scss" scoped>
:deep(.bulbLiquid path) {
  stroke-width: 18pt !important;
  stroke-linecap: round;
  fill: none;
}
</style>
