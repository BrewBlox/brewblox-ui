<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SvgEmbedded',
  props: {
    contentClass: {
      type: [String, Array, Object],
      default: 'fit column items-center',
    },
  },
});
</script>

<template>
  <foreignObject>
    <div :class="contentClass" style="position: static">
      <slot />
    </div>
  </foreignObject>
</template>

<style lang="sass">
.embedded-wrapper .q-icon
  position: static !important
  font-size: medium
</style>
