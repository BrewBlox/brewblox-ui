<script lang="ts">
import { mdiTestTube } from '@quasar/extras/mdi-v5';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SensorSvgIcon',
  props: {
    color: {
      type: String,
      default: 'white',
    },
  },
  setup() {
    return { mdiTestTube };
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
      :d="mdiTestTube"
      :fill="color"
      stroke="none"
      transform="rotate(25, 12, 12)"
    />
  </svg>
</template>
