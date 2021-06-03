<script lang="ts">
import { svgPathProperties } from 'svg-path-properties';
import { computed, defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'LiquidStroke',
  props: {
    colors: {
      type: Array as PropType<string[]>,
      required: true,
    },
    paths: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },
  setup(props) {

    const pathLengths = computed<number[]>(
      () => props.paths.map(v => new svgPathProperties(v).getTotalLength()),
    );

    const dashArrays = computed<number[][]>(
      () => {
        const numColors = props.colors.length;
        if (numColors < 2) {
          return [[1]];
        }
        return pathLengths.value.map(v => {
          const colorLength = v / numColors;
          return Array.from(new Array(numColors * 2), (x, i) => (i % 2 ? v - colorLength : colorLength));
        });
      },
    );

    return {
      pathLengths,
      dashArrays,
    };
  },
});
</script>

<template>
  <g v-if="colors.length == 1">
    <path
      v-for="(path, pidx) in paths"
      :key="`path-${pidx}`"
      :d="path"
      :stroke="colors[0]"
      stroke-linecap="butt"
      class="liquid"
    />
  </g>
  <g v-else-if="colors.length > 1">
    <template v-for="(path, pidx) in paths">
      <path
        v-for="(color, cidx) in colors"
        :key="`${pidx}-${cidx}`"
        :d="path"
        :stroke="color"
        :stroke-dashoffset="cidx * dashArrays[pidx][0]"
        :stroke-dasharray="dashArrays[pidx].join(',')"
        stroke-linecap="butt"
        class="liquid"
      />
    </template>
  </g>
</template>
