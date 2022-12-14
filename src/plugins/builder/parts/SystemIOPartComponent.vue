<script lang="ts">
import { RIGHT } from '@/plugins/builder/const';
import {
  flowOnCoord,
  horizontalChevrons,
  liquidOnCoord,
} from '@/plugins/builder/utils';
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';

const chevrons = horizontalChevrons(15, 25);
const paths = {
  borders: ['M30,21 H50', 'M30,29 H50'],
  liquid: 'M30,25 H50',
  arrows: 'M25,25 H50',
};

export default defineComponent({
  name: 'SystemIOPartComponent',
  setup() {
    const { part, width, height } = usePart.setup();

    const flowSpeed = computed<number>(() => flowOnCoord(part.value, RIGHT));

    const liquids = computed<string[]>(() => liquidOnCoord(part.value, RIGHT));

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
    viewBox="0 0 50 50"
  >
    <LiquidStroke
      :paths="[paths.liquid]"
      :colors="liquids"
    />
    <AnimatedArrows
      :num-arrows="1"
      :speed="flowSpeed"
      :path="paths.arrows"
    />
    <g class="outline">
      <path
        v-if="flowSpeed > 0"
        :d="chevrons.right"
      />
      <path
        v-else-if="flowSpeed < 0"
        :d="chevrons.left"
      />
      <path
        v-else
        :d="chevrons.straight"
      />
      <path :d="paths.borders[0]" />
      <path :d="paths.borders[1]" />
    </g>
  </svg>
</template>
