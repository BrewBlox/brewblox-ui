<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { LEFT } from '@/plugins/builder/const';

import { FlowPart } from '../types';
import { flowOnCoord, liquidOnCoord } from '../utils';

const paths = {
  borders: [
    'M29,40V30a9,9,0,0,0-9-9H0',
    'M21,40V32a3,3,0,0,0-3-3H0',
  ],
  liquid: 'M0,25H20a5,5,0,0,1,5,5V40',
};

export default defineComponent({
  name: 'DipTube',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const flowSpeed = computed<number>(
      () => -flowOnCoord(props.part, LEFT),
    );

    const liquids = computed<string[]>(
      () => liquidOnCoord(props.part, LEFT),
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
    <g class="outline">
      <rect fill="white" y="12.5" width="8" height="8" />
      <rect fill="white" y="30" width="8" height="8" />
      <path v-for="border in paths.borders" :key="border" :d="border" />
    </g>
    <LiquidStroke :paths="[paths.liquid]" :colors="liquids" />
    <AnimatedArrows :speed="flowSpeed" :path="paths.liquid" />
  </g>
</template>
