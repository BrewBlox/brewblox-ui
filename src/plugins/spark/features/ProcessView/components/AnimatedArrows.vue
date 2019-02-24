<script lang="ts">
/* eslint-disable vue/attribute-hyphenation */
import Vue from 'vue';
import Component from 'vue-class-component';
import { svgPathProperties } from 'svg-path-properties';

@Component({
  props: {
    path: {
      type: String,
      required: true,
    },
    speed: {
      type: Number,
      default: 0,
    },
    numArrows: {
      type: Number,
      default: 2,
    },
  },
})
export default class AnimatedArrows extends Vue {
  get pathLength() {
    return svgPathProperties(this.$props.path).getTotalLength();
  }

  get duration() {
    if (this.$props.speed && this.pathLength) {
      return this.pathLength / (25 * Math.abs(this.$props.speed));
    }
    return 0;
  }

  get reversed() {
    return this.$props.speed < 0;
  }

  get starts(): string[] {
    const interval = this.duration / this.$props.numArrows;
    return [...Array(this.$props.numArrows).keys()]
      .map(idx => `${idx * interval}s`);
  }

  get transform() {
    // Flips the arrow
    return this.reversed
      ? 'scale (-1, 1)'
      : '';
  }

  get keyPoints() {
    // Makes the arrow travel end-to-start
    return this.reversed
      ? '1;0'
      : '0;1';
  }
}
</script>

<template>
  <g>
    <g v-for="start in starts" :key="start" visibility="hidden">
      <path :transform="transform" d="M-4,-4 L0,0 M-4,4 L0,0" class="outline"/>
      <!-- Note: SVG attributes are case-sensitive -->
      <animateMotion
        :path="$props.path"
        :begin="start"
        :keyPoints="keyPoints"
        :dur="`${duration}s`"
        fill="freeze"
        repeatCount="indefinite"
        rotate="auto"
        calcMode="linear"
        keyTimes="0;1"
      />
      <set :begin="start" attributeName="visibility" from="hidden" to="visible"/>
    </g>
  </g>
</template>
