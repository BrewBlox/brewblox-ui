<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { svgPathProperties } from 'svg-path-properties';

@Component({
  props: {
    colors: {
      type: Array,
      required: true,
    },
    paths: {
      type: Array,
      required: true,
    },
  },
})
export default class LiquidStroke extends Vue {
  get pathLengths() {
    return this.$props.paths.map(v => svgPathProperties(v).getTotalLength());
  }

  get dashArrays() {
    const numColors = this.$props.colors.length;
    if (numColors < 2) {
      return [1];
    }
    return this.pathLengths.map(v => {
      const colorLength = v / numColors;
      return Array.from(new Array(numColors * 2), (x, i) => (i % 2 ? v - colorLength : colorLength));
    });
  }
}
</script>

<template>
  <g v-if="colors.length == 1">
    <template v-for="(path, pidx) in paths">
      <path :d="path" :key="`${pidx}`" :stroke="colors[0]" stroke-linecap="butt" class="liquid"/>
    </template>
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
