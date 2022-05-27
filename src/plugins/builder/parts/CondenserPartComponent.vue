<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { coord2grid, elbow } from '@/plugins/builder/utils';

import { usePart } from '../composables';
import { FlowPart } from '../types';

export default defineComponent({
  name: 'CondenserPartComponent',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const { sizeX, sizeY } = usePart.setup(props.part);

    function outlinePath(closed: boolean): string {
      const moveChar = closed ? 'L' : 'M';
      return [
        'M0,21 H10 V10',
        `${elbow(4, -4, false)} H21 V0`,
        `${moveChar}29,0 V6 H36`,
        `${elbow(4, 4, true)} V90`,
        `${elbow(-4, 4, false)} H29 V100`,
        `${moveChar}21,100 V94 H14`,
        `${elbow(-4, -4, true)} V29 H0`,
      ].join(' ');
    }

    const casing = outlinePath(false);
    const smokeArea = outlinePath(true);

    return {
      coord2grid,
      casing,
      smokeArea,
      sizeX,
      sizeY,
    };
  },
});
</script>

<template>
  <g>
    <path
      :d="smokeArea"
      fill="lightgrey"
      fill-opacity="0.3"
    />
    <g class="outline">
      <path :d="casing" />
      <AnimatedArrows
        path="M25,0 V90"
        :num-arrows="4"
        :speed="1"
      />
    </g>
  </g>
</template>
