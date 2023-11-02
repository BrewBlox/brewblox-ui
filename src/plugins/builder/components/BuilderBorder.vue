<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  color?: string;
  large?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  width: 50,
  height: 50,
  x: 0,
  y: 0,
  color: 'white',
  large: false,
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
