<script lang="ts">
import { mdiChartLine } from '@quasar/extras/mdi-v5';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ChartSvgIcon',
  props: {
    color: {
      type: String,
      default: 'white',
    },
  },
  setup() {
    return { mdiChartLine };
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
