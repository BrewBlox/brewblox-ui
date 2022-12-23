<script lang="ts">
import { LEFT } from '@/plugins/builder/const';
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';
import { flowOnCoord, liquidOnCoord } from '../utils';

const paths = {
  borders: ['M29,40V30a9,9,0,0,0-9-9H0', 'M21,40V32a3,3,0,0,0-3-3H0'],
  liquid: ['M0,25H20a5,5,0,0,1,5,5V40'],
};

export default defineComponent({
  name: 'DipTubePartComponent',
  setup() {
    const { part, width, height } = usePart.setup();

    const flowSpeed = computed<number>(() => -flowOnCoord(part.value, LEFT));

    const liquids = computed<string[]>(() => liquidOnCoord(part.value, LEFT));

    return {
      width,
      height,
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
    <g class="outline fill">
      <rect
        y="12.5"
        width="8"
        height="8"
      />
      <rect
        y="30"
        width="8"
        height="8"
      />
    </g>
    <g class="outline">
      <path
        v-for="border in paths.borders"
        :key="border"
        :d="border"
      />
    </g>
    <LiquidStroke
      :paths="paths.liquid"
      :colors="liquids"
    />
    <AnimatedArrows
      :speed="flowSpeed"
      :path="paths.liquid[0]"
    />
  </svg>
</template>
