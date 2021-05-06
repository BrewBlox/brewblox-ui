<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { RIGHT } from '@/plugins/builder/const';
import { flowOnCoord, horizontalChevrons, liquidOnCoord } from '@/plugins/builder/utils';

import { FlowPart } from '../types';

const chevrons = horizontalChevrons(15, 25);
const paths = {
  borders: [
    'M30,21 H50',
    'M30,29 H50',
  ],
  liquid: 'M30,25 H50',
  arrows: 'M25,25 H50',
};

export default defineComponent({
  name: 'SystemIO',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const flowSpeed = computed<number>(
      () => flowOnCoord(props.part, RIGHT),
    );

    const liquids = computed<string[]>(
      () => liquidOnCoord(props.part, RIGHT),
    );

    const arrowTransform = computed<string>(
      () => flowSpeed.value < 0
        ? 'rotate(180)'
        : '',
    );

    return {
      chevrons,
      paths,
      flowSpeed,
      liquids,
      arrowTransform,
    };
  },
});
</script>

<template>
  <g>
    <LiquidStroke :paths="[paths.liquid]" :colors="liquids" />
    <AnimatedArrows :num-arrows="1" :speed="flowSpeed" :path="paths.arrows" />
    <g class="outline">
      <g v-if="flowSpeed > 0">
        <polyline v-for="line in chevrons.right" :key="line" :points="line" />
      </g>
      <g v-else-if="flowSpeed < 0">
        <polyline v-for="line in chevrons.left" :key="line" :points="line" />
      </g>
      <g v-else>
        <polyline v-for="line in chevrons.straight" :key="line" :points="line" />
      </g>
      <path :d="paths.borders[0]" />
      <path :d="paths.borders[1]" />
    </g>
  </g>
</template>
