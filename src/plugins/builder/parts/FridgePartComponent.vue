<script lang="ts">
import { computed, defineComponent } from 'vue';
import { DEFAULT_SHELF_Y, SHELF_Y_KEY } from '../blueprints/Fridge';
import { usePart } from '../composables';
import { coord2grid } from '../utils';

export default defineComponent({
  name: 'FridgePartComponent',
  props: { ...usePart.props },
  emits: [...usePart.emits],
  setup(props) {
    const shelfHeight = computed<number>(() =>
      coord2grid(props.part.settings[SHELF_Y_KEY] || DEFAULT_SHELF_Y),
    );

    return {
      shelfHeight,
    };
  },
});
</script>

<template>
  <svg v-bind="{ width, height }">
    <g class="outline">
      <rect
        :width="width - 4"
        :height="height - 4"
        x="2"
        y="2"
        rx="8"
        ry="8"
        stroke-width="4px"
      />
      <!-- Top divider -->
      <line
        :x1="2"
        :y1="50"
        :x2="width - 4"
        :y2="50"
      />
      <!-- Bottom divider -->
      <line
        :x1="2"
        :y1="height - 50"
        :x2="width - 4"
        :y2="height - 50"
      />
      <!-- Shelf divider-->
      <line
        :x1="2"
        :y1="shelfHeight"
        :x2="width - 4"
        :y2="shelfHeight"
      />
    </g>
    <BuilderLabelValues
      :part="part"
      :width="width"
      :height="50"
      @update:part="(v) => $emit('update:part', v)"
    />
  </svg>
</template>
