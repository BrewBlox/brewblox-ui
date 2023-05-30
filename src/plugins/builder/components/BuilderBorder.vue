<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  width: {
    type: Number,
    default: 50,
  },
  height: {
    type: Number,
    default: 50,
  },
  x: {
    type: Number,
    default: 0,
  },
  y: {
    type: Number,
    default: 0,
  },
  color: {
    type: String,
    default: 'white',
  },
  large: {
    type: Boolean,
    default: false,
  },
});

const thickness = computed<number>(() => (props.large ? 4 : 2));

const dimensions = computed(() => ({
  width: props.width - thickness.value,
  height: props.height - thickness.value,
  x: 0.5 * thickness.value,
  y: 0.5 * thickness.value,
  rx: 2 * thickness.value,
  ry: 2 * thickness.value,
  'stroke-width': thickness.value,
}));
</script>

<template>
  <rect
    v-bind="dimensions"
    :stroke="color || 'white'"
  />
</template>
