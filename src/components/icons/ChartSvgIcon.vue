<script setup lang="ts">
import { mdiChartLine } from '@quasar/extras/mdi-v5';

defineProps({
  color: {
    type: String,
    default: 'white',
  },
});
</script>

<template>
  <svg
    :fill="color"
    width="40"
    height="40"
    x="5"
    y="5"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    stroke="none"
  >
    <path :d="mdiChartLine" />
  </svg>
</template>
