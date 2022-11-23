<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PwmSvgIcon',
});
</script>

<template>
  <svg
    width="40"
    height="40"
    x="5"
    y="5"
    viewBox="0 0 50 50"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5,35 h5 v-18 h10 v18 h10 v-18 h10 v18 H45"
      class="icon"
    />
  </svg>
</template>

<style lang="sass" scoped>
.icon
  fill: none
  stroke: white
  stroke-width: 3.5px
</style>
