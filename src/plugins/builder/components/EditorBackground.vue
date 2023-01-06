<script lang="ts">
import { defineComponent } from 'vue';
import { coord2grid } from '../utils';

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
      coord2grid,
    };
  },
});
</script>

<template>
  <g>
    <!-- Grid lines -->
    <line
      v-for="x in width - 1"
      :key="`grid-x-${x}`"
      :x1="coord2grid(x)"
      :x2="coord2grid(x)"
      :y1="0"
      :y2="coord2grid(height)"
      class="grid-line"
    />
    <line
      v-for="y in height - 1"
      :key="`grid-y-${y}`"
      :x1="0"
      :x2="coord2grid(width)"
      :y1="coord2grid(y)"
      :y2="coord2grid(y)"
      class="grid-line"
    />
    <!-- Coordinate numbers -->
    <text
      v-for="x in width"
      :key="`edge-x-${x}`"
      :x="coord2grid(x - 1) + 20"
      :y="8"
      fill="white"
      class="grid-square-text"
    >
      {{ x - 1 }}
    </text>
    <text
      v-for="y in height"
      :key="`edge-y-${y}`"
      :x="0"
      :y="coord2grid(y - 1) + 28"
      fill="white"
      class="grid-square-text"
    >
      {{ y - 1 }}
    </text>
  </g>
</template>

<style lang="sass" scoped>
.grid-line
  stroke: white
  stroke-width: 0.2
  opacity: 0.6

.grid-square-text
  font-size: x-small
  z-index: 2
  -webkit-user-select: none
  -moz-user-select: none
  -ms-user-select: none
  user-select: none
</style>
