<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SpinnerSvgIcon',
  props: {
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
      default: 'grey',
    },
  },
});
</script>

<template>
  <svg
    v-bind="{ width, height, x, y }"
    class="spinner"
    viewBox="0 0 50 50"
  >
    <circle
      :stroke="color"
      cx="25"
      cy="25"
      r="20"
      stroke-width="5"
      stroke-linecap="round"
      v-bind="$attrs"
    />
  </svg>
</template>

<style lang="sass" scoped>
.spinner
  animation: rotate 2s linear infinite

  > circle
    animation: dash 1.5s ease-in-out infinite

@keyframes rotate
  100%
    transform: rotate(360deg)

@keyframes dash
  0%
    stroke-dasharray: 1, 150
    stroke-dashoffset: 0
  50%
    stroke-dasharray: 90, 150
    stroke-dashoffset: -35
  100%
    stroke-dasharray: 90, 150
    stroke-dashoffset: -124
</style>
