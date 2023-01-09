<script lang="ts">
import { mdiBullseyeArrow } from '@quasar/extras/mdi-v5';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SetpointSvgIcon',
  props: {
    color: {
      type: String,
      default: 'white',
    },
  },
  setup() {
    return { mdiBullseyeArrow };
  },
});
</script>

<template>
  <svg
    :stroke="color"
    width="40"
    height="40"
    x="5"
    y="5"
    fill="none"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="6"
      cy="8"
      r="3"
    />
    <line
      x1="6"
      y1="11"
      x2="6"
      y2="27"
    />
    <circle
      cx="16"
      cy="20"
      r="3"
    />
    <line
      x1="16"
      y1="5"
      x2="16"
      y2="17"
    />
    <line
      x1="16"
      y1="23"
      x2="16"
      y2="27"
    />
    <circle
      cx="26"
      cy="14"
      r="3"
    />
    <line
      x1="26"
      y1="17"
      x2="26"
      y2="27"
    />
    <line
      x1="26"
      y1="5"
      x2="26"
      y2="11"
    />
  </svg>
</template>
