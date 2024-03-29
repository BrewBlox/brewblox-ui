<script setup lang="ts">
import { svgPathProperties } from 'svg-path-properties';
import { computed } from 'vue';

interface Props {
  colors: string[];
  paths: string[];
}

const props = defineProps<Props>();

const pathLengths = computed<number[]>(() =>
  props.paths.map((v) => new svgPathProperties(v).getTotalLength()),
);

const dashArrays = computed<number[][]>(() => {
  const numColors = props.colors.length;
  if (numColors < 2) {
    return [[1]];
  }
  return pathLengths.value.map((v) => {
    const colorLength = v / numColors;
    return Array.from(new Array(numColors * 2), (x, i) =>
      i % 2 ? v - colorLength : colorLength,
    );
  });
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
      stroke-width="7"
      v-bind="$attrs"
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
        stroke-width="7"
        v-bind="$attrs"
      />
    </template>
  </g>
</template>
