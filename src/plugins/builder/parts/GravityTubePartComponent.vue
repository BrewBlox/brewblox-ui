<script lang="ts">
import { RIGHT } from '@/plugins/builder/const';
import { computed, defineComponent, PropType } from 'vue';
import { FlowPart } from '../types';
import { flowOnCoord, liquidOnCoord } from '../utils';

const paths = {
  borders: ['M 0,21 H 50', 'M 0,29 H 50'],
  liquid: 'M 0,25 H 50',
};

export default defineComponent({
  name: 'GravityTubePartComponent',
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
      <path :d="paths.borders[0]" />
      <path :d="paths.borders[1]" />
      <!-- Arrow -->
      <polyline points="20.5,10 16.5,6 20.5,2 " />
      <line
        x1="32.5"
        y1="6"
        x2="16.5"
        y2="6"
      />
      <line
        x1="0"
        y1="21"
        x2="11"
        y2="21"
      />
      <line
        x1="0"
        y1="29"
        x2="9"
        y2="29"
      />
    </g>
    <LiquidStroke
      :paths="[paths.liquid]"
      :colors="liquids"
    />
    <AnimatedArrows
      :speed="flowSpeed"
      path="M0,25H50"
    />
  </g>
</template>
