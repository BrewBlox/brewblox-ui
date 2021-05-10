<script lang="ts">
import { defineComponent } from 'vue';

import { squares } from '../utils';


export default defineComponent({
  name: 'EditorBackground',
  props: {
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
  },
  setup() {
    return {
      squares,
    };
  },
});
</script>

<template>
  <g>
    <foreignObject
      class="grid-background"
      :width="squares(width)"
      :height="squares(height)"
    />
    <!-- Coordinate numbers -->
    <text
      v-for="x in width"
      :key="`edge-x-${x}`"
      :x="squares(x-1)+20"
      :y="8"
      fill="white"
      class="grid-square-text"
    >
      {{ x-1 }}
    </text>
    <text
      v-for="y in height"
      :key="`edge-y-${y}`"
      :x="0"
      :y="squares(y-1)+28"
      fill="white"
      class="grid-square-text"
    >
      {{ y-1 }}
    </text>
  </g>
</template>

<style lang="scss" scoped>
$grid-line: rgba(255, 255, 255, 0.15);

.grid-background {
  background-image: linear-gradient($grid-line 1px, transparent 1px),
    linear-gradient(90deg, $grid-line 1px, transparent 1px);
  background-size: 50px 50px, 50px 50px;
  background-position: 0 -1px, -1px 0;
  pointer-events: none;
}

.grid-square-text {
  font-size: x-small;
  z-index: 2;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
