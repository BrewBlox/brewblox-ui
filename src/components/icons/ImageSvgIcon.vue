<script setup lang="ts">
import { mdiImageFrame } from '@quasar/extras/mdi-v5';

defineProps({
  color: {
    type: String,
    default: 'white',
  },
});
</script>

<template>
  <svg
    width="40"
    height="40"
    x="5"
    y="5"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      :d="mdiImageFrame"
      :fill="color"
      stroke="none"
    />
  </svg>
</template>
