<script lang="ts">
import { LEFT } from '@/plugins/builder/const';
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';
import { flowOnCoord, liquidOnCoord } from '../utils';

const paths = {
  borders: ['M 0,21 L 25,21', 'M 0,29 L 25,29'],
  liquid: 'M0,25 H25',
};

export default defineComponent({
  name: 'StraightInletTubePartComponent',
  props: { ...usePart.props },
  emits: [...usePart.emits],
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
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 50 50"
  >
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
  </svg>
</template>
