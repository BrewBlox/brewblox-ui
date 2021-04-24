<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { RIGHT } from '@/plugins/builder/const';
import { elbow, flowOnCoord, liquidOnCoord } from '@/plugins/builder/utils';

import { FlowPart } from '../types';

const paths = {
  borders: [
    `M21,0 v17 ${elbow(12, 12, false)} H50`,
    `M29,0 v17 ${elbow(4, 4, false)} H50`,
  ],
  liquid: `M25,0 v17 ${elbow(8, 8, false)} H50`,
};

export default defineComponent({
  name: 'ElbowTube',
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

    return {
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
    <AnimatedArrows :speed="flowSpeed" :path="paths.liquid" />
    <g class="outline">
      <path :d="paths.borders[0]" />
      <path :d="paths.borders[1]" />
    </g>
  </g>
</template>
