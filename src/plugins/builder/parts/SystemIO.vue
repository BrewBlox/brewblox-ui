<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { RIGHT } from '@/plugins/builder/const';
import {
  flowOnCoord,
  horizontalChevrons,
  liquidOnCoord,
} from '@/plugins/builder/utils';

import { FlowPart } from '../types';

const chevrons = horizontalChevrons(15, 25);
const paths = {
  borders: ['M30,21 H50', 'M30,29 H50'],
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
    const flowSpeed = computed<number>(() => flowOnCoord(props.part, RIGHT));

    const liquids = computed<string[]>(() => liquidOnCoord(props.part, RIGHT));

    return {
      chevrons,
      paths,
      flowSpeed,
      liquids,
    };
  },
});
</script>

<template>
  <g>
    <LiquidStroke :paths="[paths.liquid]" :colors="liquids" />
    <AnimatedArrows :num-arrows="1" :speed="flowSpeed" :path="paths.arrows" />
    <g class="outline">
      <path v-if="flowSpeed > 0" :d="chevrons.right" />
      <path v-else-if="flowSpeed < 0" :d="chevrons.left" />
      <path v-else :d="chevrons.straight" />
      <path :d="paths.borders[0]" />
      <path :d="paths.borders[1]" />
    </g>
  </g>
</template>
