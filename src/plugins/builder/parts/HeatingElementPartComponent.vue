<script lang="ts">
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';

export default defineComponent({
  name: 'HeatingElementPartComponent',
  setup() {
    const { bordered, width, height } = usePart.setup();

    const path = computed<string>(() => {
      const straight = width.value - 100;
      return `M50,24.7h24c7.1,0,6.6-6.7,14-6.7 h${straight} c0,0,7,0.1,7,7 c0,7-7,7-7,7 H90`;
    });

    return {
      bordered,
      width,
      height,
      path,
    };
  },
});
</script>

<template>
  <!-- No viewBox. width is auto-adjusted -->
  <svg v-bind="{ width, height }">
    <PwmValues :bordered="bordered" />
    <g class="outline">
      <path :d="path" />
    </g>
  </svg>
</template>
