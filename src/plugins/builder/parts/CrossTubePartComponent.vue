<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { DOWN, LEFT, RIGHT, UP } from '@/plugins/builder/const';

import { FlowPart } from '../types';
import { flowOnCoord, liquidOnCoord } from '../utils';

type Direction = 'up' | 'down' | 'left' | 'right'
const paths = {
  up: 'M25,25 V0',
  down: 'M25,25 V50',
  left: 'M25,25 H0',
  right: 'M25,25 H50',
};

export default defineComponent({
  name: 'CrossTubePartComponent',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const speed = computed<Record<Direction, number>>(
      () => ({
        up: flowOnCoord(props.part, UP),
        down: flowOnCoord(props.part, DOWN),
        left: flowOnCoord(props.part, LEFT),
        right: flowOnCoord(props.part, RIGHT),
      }),
    );

    const liquids = computed<Record<Direction, string[]>>(
      () => ({
        up: liquidOnCoord(props.part, UP),
        down: liquidOnCoord(props.part, DOWN),
        left: liquidOnCoord(props.part, LEFT),
        right: liquidOnCoord(props.part, RIGHT),
      }),
    );

    return {
      paths,
      speed,
      liquids,
    };
  },
});
</script>

<template>
  <g>
    <g class="outline">
      <polyline points="50,21 29,21 29,0" />
      <polyline points="21,0 21,21 0,21" />
      <polyline points="0,29 21,29 21,50" />
      <polyline points="29,50 29,29 50,29" />
    </g>
    <LiquidStroke :paths="[paths.up]" :colors="liquids.up" />
    <LiquidStroke :paths="[paths.down]" :colors="liquids.down" />
    <LiquidStroke :paths="[paths.left]" :colors="liquids.left" />
    <LiquidStroke :paths="[paths.right]" :colors="liquids.right" />
    <g class="outline">
      <AnimatedArrows :path="paths.up" :num-arrows="1" :speed="speed.up" />
      <AnimatedArrows :path="paths.down" :num-arrows="1" :speed="speed.down" />
      <AnimatedArrows :path="paths.left" :num-arrows="1" :speed="speed.left" />
      <AnimatedArrows :path="paths.right" :num-arrows="1" :speed="speed.right" />
    </g>
  </g>
</template>
