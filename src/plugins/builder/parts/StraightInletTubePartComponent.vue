<script lang="ts">
import { LEFT } from '@/plugins/builder/const';
import { computed, defineComponent, PropType } from 'vue';
import { FlowPart } from '../types';
import { flowOnCoord, liquidOnCoord } from '../utils';

const paths = {
  borders: ['M 0,21 L 25,21', 'M 0,29 L 25,29'],
  liquid: 'M0,25 H25',
};

export default defineComponent({
  name: 'StraightInletTubePartComponent',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const flowSpeed = computed<number>(() => -flowOnCoord(props.part, LEFT));

    const liquids = computed<string[]>(() => liquidOnCoord(props.part, LEFT));

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
      <rect
        fill="white"
        y="12.5"
        width="8"
        height="8"
      />
      <rect
        fill="white"
        y="30"
        width="8"
        height="8"
      />
      <path
        v-for="border in paths.borders"
        :key="border"
        :d="border"
      />
    </g>
    <LiquidStroke
      :paths="[paths.liquid]"
      :colors="liquids"
    />
    <AnimatedArrows
      :num-arrows="1"
      :speed="flowSpeed"
      :path="paths.liquid"
    />
  </g>
</template>
