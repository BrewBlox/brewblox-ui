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
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      :d="mdiBullseyeArrow"
      class="icon"
    />
  </svg>
</template>

<style lang="sass" scoped>
.icon
  fill: white
  stroke: none
</style>
