<script setup lang="ts">
import { svgPathProperties } from 'svg-path-properties';
import { computed } from 'vue';

const props = defineProps({
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
});

const pathLength = computed<number>(() =>
  new svgPathProperties(props.path).getTotalLength(),
);

const duration = computed<number>(() => {
  if (props.speed && pathLength.value) {
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
  <g v-if="speed">
    <g
      v-for="start in starts"
      :key="start"
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
