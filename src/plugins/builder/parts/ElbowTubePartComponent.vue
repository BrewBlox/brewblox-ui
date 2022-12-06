<script lang="ts">
import { RIGHT } from '@/plugins/builder/const';
import { elbow, flowOnCoord, liquidOnCoord } from '@/plugins/builder/utils';
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';

const paths = {
  borders: [
    `M21,0 v17 ${elbow(12, 12, false)} H50`,
    `M29,0 v17 ${elbow(4, 4, false)} H50`,
  ],
  liquid: `M25,0 v17 ${elbow(8, 8, false)} H50`,
};

export default defineComponent({
  name: 'ElbowTubePartComponent',
  props: { ...usePart.props },
  emits: [...usePart.emits],
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
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 50 50"
  >
    <LiquidStroke
      :paths="[paths.liquid]"
      :colors="liquids"
    />
    <AnimatedArrows
      :speed="flowSpeed"
      :path="paths.liquid"
    />
    <g class="outline">
      <path :d="paths.borders[0]" />
      <path :d="paths.borders[1]" />
    </g>
  </svg>
</template>
