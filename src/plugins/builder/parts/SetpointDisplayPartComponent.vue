<script lang="ts">
import { CENTER } from '@/plugins/builder/const';
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';
import { liquidOnCoord } from '../utils';

export default defineComponent({
  name: 'SetpointDisplayPartComponent',
  setup() {
    const { part, width, height, bordered } = usePart.setup();

    const color = computed<string>(
      () => liquidOnCoord(part.value, CENTER)[0] ?? '',
    );

    return {
      width,
      height,
      bordered,
      color,
    };
  },
});
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 100 50"
  >
    <SetpointValues />
    <g class="outline">
      <rect
        v-show="bordered"
        :width="100 - 2"
        :height="50 - 2"
        :stroke="color"
        stroke-width="2px"
        x="1"
        y="1"
        rx="6"
        ry="6"
      />
    </g>
  </svg>
</template>
