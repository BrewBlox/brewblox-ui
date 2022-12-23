<script lang="ts">
import { LEFT, RIGHT, UP } from '@/plugins/builder/const';
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';
import { flowOnCoord, liquidOnCoord } from '../utils';

export default defineComponent({
  name: 'TeeTubePartComponent',
  setup() {
    const { part, width, height } = usePart.setup();

    const topSpeed = computed<number>(() => flowOnCoord(part.value, UP));

    const leftSpeed = computed<number>(() => flowOnCoord(part.value, LEFT));

    const rightSpeed = computed<number>(() => flowOnCoord(part.value, RIGHT));

    const topLiquids = computed<string[]>(() => liquidOnCoord(part.value, UP));

    const leftLiquids = computed<string[]>(() =>
      liquidOnCoord(part.value, LEFT),
    );

    const rightLiquids = computed<string[]>(() =>
      liquidOnCoord(part.value, RIGHT),
    );

    return {
      width,
      height,
      topSpeed,
      leftSpeed,
      rightSpeed,
      topLiquids,
      leftLiquids,
      rightLiquids,
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
      <path d="M0,21H21V0" />
      <path d="M50,21H29V0" />
      <path d="M0,29H50" />
    </g>
    <LiquidStroke
      :paths="['M25,22V0']"
      :colors="topLiquids"
    />
    <LiquidStroke
      :paths="['M0,25H25']"
      :colors="leftLiquids"
    />
    <LiquidStroke
      :paths="['M25,25H50']"
      :colors="rightLiquids"
    />
    <g class="outline">
      <AnimatedArrows
        :num-arrows="1"
        :speed="topSpeed"
        path="M25,25 V0"
      />
      <AnimatedArrows
        :num-arrows="1"
        :speed="leftSpeed"
        path="M25,25 H0"
      />
      <AnimatedArrows
        :num-arrows="1"
        :speed="rightSpeed"
        path="M25,25 H50"
      />
    </g>
  </svg>
</template>
