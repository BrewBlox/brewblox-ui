<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { elbow, flowOnCoord, liquidOnCoord, squares } from '@/plugins/builder/utils';
import { Coordinates } from '@/utils/coordinates';

import { usePart } from '../composables';
import { FlowPart } from '../types';

export default defineComponent({
  name: 'RimsTube',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const {
      sizeX,
    } = usePart.setup(props.part);

    const paths = computed<Mapped<string>>(
      () => {
        const startLast = squares(sizeX.value - 1);
        return {
          closeLeft: 'M50,10 v30',
          entry: `M71,0 v10 M79,0 v10 M${startLast + 21},0 v10 M${startLast + 29},0 v10`,
          content: `M50,25 H${startLast + 48}`,
          casing: `M50,10 H71 M79,10 H${startLast + 21} M${startLast + 29},10 ` +
            `H${startLast + 50 - 4 - 2} ${elbow(4, 4, true)} V36 ${elbow(-4, 4, false)} H50 V10`,
          element: `M50,24.7h24c7.1,0,6.6-6.7,14-6.7 H${startLast + 25} c0,0,7,0.1,7,7 c0,7-7,7-7,7 H90`,
          flowPath: `M75,0 v17 ${elbow(8, 8, false)}` +
            `H${startLast + 17} ${elbow(8, -8, true)} V0`,
        };
      },
    );

    const outCoord = computed<string>(
      () => new Coordinates([sizeX.value - 0.5, 0, 0]).toString(),
    );

    const flowSpeed = computed<number>(
      () => flowOnCoord(props.part, outCoord.value),
    );

    const liquids = computed<string[]>(
      () => liquidOnCoord(props.part, outCoord.value),
    );

    return {
      paths,
      sizeX,
      flowSpeed,
      liquids,
    };
  },
});
</script>

<template>
  <g>
    <PwmValues :part="part" settings-key="pwm" />
    <LiquidStroke :paths="[paths.content]" :colors="liquids" class="contentLiquid" />
    <LiquidStroke :paths="[paths.flowPath]" :colors="liquids" />
    <AnimatedArrows :num-arrows="(sizeX-1)*2" :speed="flowSpeed" :path="paths.flowPath" />
    <g class="outline">
      <!-- <path :d="paths.closeLeft" /> -->
      <path :d="paths.entry" />
      <path :d="paths.casing" />
      <path :d="paths.element" />
    </g>
  </g>
</template>

<style lang="scss" scoped>
:deep(.contentLiquid path) {
  stroke-width: 30 !important;
  stroke-linecap: butt;
  fill: none;
}
</style>
