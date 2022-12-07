<script lang="ts">
import { LEFT } from '@/plugins/builder/const';
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';
import { flowOnCoord, liquidOnCoord } from '../utils';

const paths = {
  borders: ['M29,40V30a9,9,0,0,0-9-9H1', 'M21,40V32a3,3,0,0,0-3-3H1'],
  liquid: 'M0,25H20a5,5,0,0,1,5,5V40',
};

export default defineComponent({
  name: 'FilterBottomPartComponent',
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
  <!-- No viewBox. path auto-adjusts to width -->
  <svg v-bind="{ width, height }">
    <g class="outline">
      <line
        :x2="width - 4"
        x1="2"
        y1="11"
        m
        y2="11"
        fill="none"
        stroke-width="4px"
        stroke-dasharray="10,6"
      />
      <rect
        x="1"
        y="12"
        width="8"
        height="8"
        fill="white"
      />
      <rect
        x="1"
        y="30"
        width="8"
        height="8"
        fill="white"
      />
      <path :d="paths.borders[0]" />
      <path :d="paths.borders[1]" />
    </g>
    <LiquidStroke
      :paths="[paths.liquid]"
      :colors="liquids"
    />
    <AnimatedArrows
      :speed="flowSpeed"
      :path="paths.liquid"
    />
  </svg>
</template>
