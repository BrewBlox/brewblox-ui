<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { RIGHT } from '@/plugins/builder/const';

import { FlowPart } from '../types';
import { flowOnCoord, liquidOnCoord } from '../utils';

const paths = {
  outerValve: [
    'M0,21h10.5c1.4-5.1,5.4-9.1,10.5-10.5C29,8.3,37.2,13,39.4,21h0.1H50',
    'M0,29h10.5h0C12.7,37,21,41.6,29,39.4C34,38,38,34,39.4,29h0.1H50',
  ],
  innerValve: [
    'M39.4,21C37.2,13,29,8.3,21,10.5c-5.1,1.4-9.1,5.4-10.5,10.5H39.4z',
    'M10.5,29C12.7,37,21,41.6,29,39.4C34,38,38,34,39.4,29H10.5z',
  ],
  openLiquid: [
    'm0,25h50',
  ],
  closedLiquid: [
    'm0,25h19',
    'm31,25h50',
  ],
  arrows: 'M0,25H50',
};

export default defineComponent({
  name: 'Valve',
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

    const closed = computed<boolean>(
      () => Boolean(props.part.settings['closed']),
    );

    return {
      paths,
      flowSpeed,
      liquids,
      closed,
    };
  },
});
</script>

<template>
  <g>
    <g key="valve-outer" class="outline">
      <path :d="paths.outerValve[0]" />
      <path :d="paths.outerValve[1]" />
    </g>
    <LiquidStroke v-if="closed" :paths="paths.closedLiquid" :colors="liquids" />
    <LiquidStroke v-else :paths="paths.openLiquid" :colors="liquids" />
    <g
      key="valve-inner"
      :transform="`rotate(${closed ? '90' : '0'}, 25, 25)`"
      class="fill outline inner"
    >
      <path :d="paths.innerValve[0]" />
      <path :d="paths.innerValve[1]" />
    </g>
    <AnimatedArrows key="valve-arrows" :speed="flowSpeed" :path="paths.arrows" />
  </g>
</template>
