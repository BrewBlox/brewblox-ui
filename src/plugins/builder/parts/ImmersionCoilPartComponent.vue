<script lang="ts">
import { computed, defineComponent } from 'vue';
import { COIL_TOP_RIGHT } from '../blueprints/ImmersionCoil';
import { usePart } from '../composables';
import { flowOnCoord, liquidOnCoord } from '../utils';

const paths = {
  borders: [
    'M41.1,40.2L95.4,46',
    'M21,45.6L4.6,43.9',
    'M59.2,49.7L29,46.5',
    'M42.3,59.5l52.9,6',
    'M21,65.1L4.6,63.4',
    'M63,69.6L29,66',
    'M71,0v17.5c0,4.9,3.1,9.1,8.5,10.7',
    'M78.8,0v16.5c0,3,1,3.8,2.7,4.5c1.2,0.5,14.9,5.8,14.9,5.8',
    'M29,33.4V0',
    'M29,52.8V41.4',
    'M21,42.2v11.4',
    'M21,0v34.2',

    `M21,61.7V70c0,4.9,4,9,9,9h10.3c14.4,0,30.8-2.5,30.8-2.5l24.2-3.1
     c2.8-0.3,4.7-3.5,2.9-6.1 c-0.8-1.2-2.1-1.8-3.5-1.8h-0.2l-23.8,3.3
     c0,0-16.3,2.3-26.1,2.3H30c-0.6,0-1-0.4-1-1v-9.2`,

    `M4.9,63.4c-2.1,0-3.8-1.6-4-3.6c-0.1-1,0.2-2.1,0.9-2.9
     c0.7-0.9,1.6-1.4,2.7-1.5L94.6,46c0.1,0,0.3,0,0.4,0 c2.1,0,3.8,1.6,4,3.6
     c0.2,2.2-1.4,4.2-3.6,4.4L4.9,63.4z`,

    `M4.9,43.9c-2.1,0-3.8-1.6-4-3.6c-0.2-2.2,1.4-4.2,3.6-4.4l90.1-9.3
     c0.1,0,0.3,0,0.4,0c2.1,0,3.8,1.6,4,3.6 c0.2,2.2-1.4,4.2-3.6,4.4L4.9,43.9z`,
  ],
  transitionLiquid: [
    'M75,0v16.8c0,4.3,1.5,6.3,5.8,8.2l14.6,5.6',
    'M42.3,75c14.6,0,29.4-2.6,29.4-2.6l23.4-3 M25,0v70c0,2.8,2.2,5,5,5h12.3',
  ],
  backLiquid: ['M 95,50 L 4.8,39.8', 'M 95,69.4 L 4.8,59.3'],
  frontLiquid: ['M 4.9,39.8 L 95.4,30.6', 'M 4.8,59.3 L 95,50'],
};

export default defineComponent({
  name: 'ImmersionCoilPartComponent',
  setup() {
    const { part, width, height } = usePart.setup();

    const flowSpeed = computed<number>(() =>
      flowOnCoord(part.value, COIL_TOP_RIGHT),
    );

    const liquids = computed<string[]>(() =>
      liquidOnCoord(part.value, COIL_TOP_RIGHT),
    );

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
    viewBox="0 0 100 100"
  >
    <LiquidStroke
      :paths="paths.backLiquid"
      :colors="liquids"
      stroke-linecap="round"
    />
    <AnimatedArrows
      :speed="flowSpeed"
      :path="paths.backLiquid[0]"
      :num-arrows="2"
    />
    <AnimatedArrows
      :speed="flowSpeed"
      :path="paths.backLiquid[1]"
      :num-arrows="2"
    />
    <LiquidStroke
      :paths="paths.transitionLiquid"
      :colors="liquids"
      stroke-linecap="round"
    />
    <AnimatedArrows
      :speed="-flowSpeed"
      :path="paths.transitionLiquid[0]"
      :num-arrows="2"
    />
    <AnimatedArrows
      :speed="flowSpeed"
      :path="paths.transitionLiquid[1]"
      :num-arrows="6"
    />
    <LiquidStroke
      :paths="paths.frontLiquid"
      :colors="liquids"
      stroke-linecap="round"
    />
    <AnimatedArrows
      :speed="flowSpeed"
      :path="paths.frontLiquid[0]"
      :num-arrows="3"
    />
    <AnimatedArrows
      :speed="flowSpeed"
      :path="paths.frontLiquid[1]"
      :num-arrows="3"
    />
    <g class="outline">
      <path
        v-for="border in paths.borders"
        :key="border"
        :d="border"
      />
    </g>
  </svg>
</template>
