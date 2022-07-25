<script lang="ts">
import { LEFT, RIGHT, UP } from '@/plugins/builder/const';
import { computed, defineComponent, PropType } from 'vue';
import { FlowPart } from '../types';
import { flowOnCoord, liquidOnCoord } from '../utils';

const paths = {
  top: 'M25,25 V0',
  left: 'M25,25 H0',
  right: 'M25,25 H50',
};

export default defineComponent({
  name: 'TeeTubePartComponent',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const topSpeed = computed<number>(() => flowOnCoord(props.part, UP));

    const leftSpeed = computed<number>(() => flowOnCoord(props.part, LEFT));

    const rightSpeed = computed<number>(() => flowOnCoord(props.part, RIGHT));

    const topLiquids = computed<string[]>(() => liquidOnCoord(props.part, UP));

    const leftLiquids = computed<string[]>(() =>
      liquidOnCoord(props.part, LEFT),
    );

    const rightLiquids = computed<string[]>(() =>
      liquidOnCoord(props.part, RIGHT),
    );

    return {
      paths,
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
  <g>
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
        :path="paths.top"
        :num-arrows="1"
        :speed="topSpeed"
      />
      <AnimatedArrows
        :path="paths.left"
        :num-arrows="1"
        :speed="leftSpeed"
      />
      <AnimatedArrows
        :path="paths.right"
        :num-arrows="1"
        :speed="rightSpeed"
      />
    </g>
  </g>
</template>
