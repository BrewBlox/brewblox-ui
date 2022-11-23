<script lang="ts">
import { mdiThermometer } from '@quasar/extras/mdi-v5';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SensorSvgIcon',
  setup() {
    return { mdiThermometer };
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
    fill="white"
    stroke="none"
  >
    <path :d="mdiThermometer" />
  </svg>
</template>
