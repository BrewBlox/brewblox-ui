<script lang="ts">
import { svgPathProperties } from 'svg-path-properties';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class LiquidStroke extends Vue {

  @Prop({ type: Array, required: true })
  readonly colors!: string[];

  @Prop({ type: Array, required: true })
  readonly paths!: string[];

  get pathLengths(): number[] {
    return this.paths.map(v => svgPathProperties(v).getTotalLength());
  }

  get dashArrays(): number[][] {
    const numColors = this.colors.length;
    if (numColors < 2) {
      return [[1]];
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
      <path :key="`${pidx}`" :d="path" :stroke="colors[0]" stroke-linecap="butt" class="liquid" />
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
