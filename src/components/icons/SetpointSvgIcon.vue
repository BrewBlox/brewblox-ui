<script lang="ts">
import { mdiBullseyeArrow } from '@quasar/extras/mdi-v5';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SetpointSvgIcon',
  setup() {
    return { mdiBullseyeArrow };
  },
});
</script>

<template>
  <svg
    width="40"
    height="40"
    x="5"
    y="5"
    fill="none"
    stroke="white"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      class="st0"
      cx="6"
      cy="8"
      r="3"
    />
    <line
      class="st0"
      x1="6"
      y1="11"
      x2="6"
      y2="27"
    />
    <circle
      class="st0"
      cx="16"
      cy="20"
      r="3"
    />
    <line
      class="st0"
      x1="16"
      y1="5"
      x2="16"
      y2="17"
    />
    <line
      class="st0"
      x1="16"
      y1="23"
      x2="16"
      y2="27"
    />
    <circle
      class="st0"
      cx="26"
      cy="14"
      r="3"
    />
    <line
      class="st0"
      x1="26"
      y1="17"
      x2="26"
      y2="27"
    />
    <line
      class="st0"
      x1="26"
      y1="5"
      x2="26"
      y2="11"
    />
  </svg>
</template>
