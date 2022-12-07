<script lang="ts">
import { elbow } from '@/plugins/builder/utils';
import { defineComponent } from 'vue';
import { usePart } from '../composables';

export default defineComponent({
  name: 'CondenserPartComponent',
  setup() {
    const { width, height } = usePart.setup();

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
      width,
      height,
      casing,
      smokeArea,
    };
  },
});
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 50 100"
  >
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
  </svg>
</template>
