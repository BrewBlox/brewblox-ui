<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { LEFT } from '@/plugins/builder/const';

import { usePart } from '../composables';
import { FlowPart } from '../types';
import { coord2grid, flowOnCoord, liquidOnCoord } from '../utils';

const paths = {
  borders: [
    'M29,40V30a9,9,0,0,0-9-9H1',
    'M21,40V32a3,3,0,0,0-3-3H1',
  ],
  liquid: 'M0,25H20a5,5,0,0,1,5,5V40',
};

export default defineComponent({
  name: 'FilterBottom',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const { sizeX } = usePart.setup(props.part);

    const flowSpeed = computed<number>(
      () => -flowOnCoord(props.part, LEFT),
    );

    const liquids = computed<string[]>(
      () => liquidOnCoord(props.part, LEFT),
    );

    return {
      coord2grid,
      paths,
      sizeX,
      flowSpeed,
      liquids,
    };
  },
});
</script>

<template>
  <g>
    <g class="outline">
      <line
        :x2="coord2grid(sizeX)-4"
        x1="2"
        y1="11"
        m
        y2="11"
        fill="none"
        stroke-width="4px"
        stroke-dasharray="10,6"
      />
      <rect x="1" y="12" width="8" height="8" fill="white" />
      <rect x="1" y="30" width="8" height="8" fill="white" />
      <path :d="paths.borders[0]" />
      <path :d="paths.borders[1]" />
    </g>
    <LiquidStroke :paths="[paths.liquid]" :colors="liquids" />
    <AnimatedArrows :speed="flowSpeed" :path="paths.liquid" />
  </g>
</template>
