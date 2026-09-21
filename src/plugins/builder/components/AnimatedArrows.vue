<script setup lang="ts">
import { svgPathProperties } from 'svg-path-properties';
import { computed } from 'vue';

interface Props {
  path: string;
  speed?: number;
  numArrows?: number;
}

const props = withDefaults(defineProps<Props>(), {
  speed: 0,
  numArrows: 2,
});

const pathLength = computed<number>(() =>
  new svgPathProperties(props.path).getTotalLength(),
);

// Calculated flows may be invalid (NaN or Infinity)
// for degenerate layouts. Invalid flows are not animated.
const active = computed<boolean>(
  () => Number.isFinite(props.speed) && props.speed !== 0,
);

const duration = computed<number>(() => {
  if (active.value && pathLength.value) {
    return pathLength.value / (25 * Math.abs(props.speed));
  }
  return 0;
});

const reversed = computed<boolean>(() => props.speed < 0);

const starts = computed<string[]>(() => {
  const interval = duration.value / props.numArrows;
  return [...Array(props.numArrows).keys()].map((idx) => `${idx * interval}s`);
});

const transform = computed<string>(
  // Flips the arrow
  () => (reversed.value ? 'scale (-1, 1)' : ''),
);

const keyPoints = computed<string>(
  // Makes the arrow travel end-to-start
  () => (reversed.value ? '1;0' : '0;1'),
);
</script>

<template>
  <g v-if="active">
    <!-- Keyed by duration: elements are recreated to restart the animation -->
    <g
      v-for="(start, idx) in starts"
      :key="`${idx}-${duration}`"
      visibility="hidden"
    >
      <path
        :transform="transform"
        d="M-3,-3 L0,0 M-3,3 L0,0"
        class="outline"
      />
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
      <set
        :begin="start"
        attributeName="visibility"
        from="hidden"
        to="visible"
      />
    </g>
  </g>
</template>
