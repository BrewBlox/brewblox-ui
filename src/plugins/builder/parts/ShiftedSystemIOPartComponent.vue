<script lang="ts">
import { UP } from '@/plugins/builder/const';
import {
  flowOnCoord,
  liquidOnCoord,
  verticalChevrons,
} from '@/plugins/builder/utils';
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';

const chevrons = verticalChevrons(50, 86.4);
const paths = {
  borders: [
    'M21,0v20c0,5,4,9,9,9 h13 c1.7,0 1.3,3 3,3 V75 ',
    'M29,0v18c0,1.7,1.3,3,3,3 h13 c5,0 9,4 9,9 V75',
  ],
  liquid: 'M25,0V20a5,5,0,0,0,5,5 h14.5 a5,5,0,0,1,5,6 V75',
  arrows: 'M25,0V20a5,5,0,0,0,5,5 h14.5 a5,5,0,0,1,5,6 V80',
};

export default defineComponent({
  name: 'ShiftedSystemIOPartComponent',
  setup() {
    const { part, width, height } = usePart.setup();

    const flowSpeed = computed<number>(() => -flowOnCoord(part.value, UP));

    const liquids = computed<string[]>(() => liquidOnCoord(part.value, UP));

    return {
      width,
      height,
      chevrons,
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
    viewBox="0 0 100 100"
  >
    <g class="outline">
      <path :d="paths.borders[0]" />
      <path :d="paths.borders[1]" />
      <path
        v-if="flowSpeed > 0"
        :d="chevrons.down"
      />
      <path
        v-else-if="flowSpeed < 0"
        :d="chevrons.up"
      />
      <path
        v-else
        :d="chevrons.straight"
      />
    </g>
    <LiquidStroke
      :paths="[paths.liquid]"
      :colors="liquids"
    />
    <AnimatedArrows
      :speed="flowSpeed"
      :path="paths.arrows"
    />
  </svg>
</template>
