<script lang="ts">
/* eslint-disable vue/attribute-hyphenation */
import { svgPathProperties } from 'svg-path-properties';
import { computed, defineComponent } from 'vue';

@Component
export default class AnimatedArrows extends Vue {

  @Prop({ type: String, required: true })
  readonly path!: string;

  @Prop({ type: Number, default: 0 })
  readonly speed!: number;

  @Prop({ type: Number, default: 2 })
  readonly numArrows!: number;

  get pathLength(): number {
    return svgPathProperties(this.path).getTotalLength();
  }

  get duration(): number {
    if (this.speed && this.pathLength) {
      return this.pathLength / (25 * Math.abs(this.speed));
    }
    return 0;
  }

  get reversed(): boolean {
    return this.speed < 0;
  }

  get starts(): string[] {
    const interval = this.duration / this.numArrows;
    return [...Array(this.numArrows).keys()]
      .map(idx => `${idx * interval}s`);
  }

  get transform(): string {
    // Flips the arrow
    return this.reversed
      ? 'scale (-1, 1)'
      : '';
  }

  get keyPoints(): string {
    // Makes the arrow travel end-to-start
    return this.reversed
      ? '1;0'
      : '0;1';
  }
}
</script>

<template>
  <g v-if="speed">
    <g v-for="start in starts" :key="start" visibility="hidden">
      <path :transform="transform" d="M-3,-3 L0,0 M-3,3 L0,0" class="outline" />
      <!-- Note: SVG attributes are case-sensitive -->
      <animateMotion
        :path="path"
        :begin="start"
        :keyPoints="keyPoints"
        :dur="`${duration}s`"
        fill="freeze"
        repeatCount="indefinite"
        rotate="auto"
        calcMode="linear"
        keyTimes="0;1"
      />
      <set :begin="start" attributeName="visibility" from="hidden" to="visible" />
    </g>
  </g>
</template>
