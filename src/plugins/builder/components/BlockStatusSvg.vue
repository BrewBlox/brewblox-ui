<script lang="ts">
import { BlockStatus } from '@/plugins/spark/types';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'BlockStatusSvg',
  props: {
    status: {
      type: [String, null] as PropType<BlockStatus | null>,
      required: true,
    },
  },
  setup() {},
});
</script>

<template>
  <circle
    cx="8"
    cy="8"
    r="3"
    stroke="black"
    stroke-width="0.5"
    :class="`block-status__${status}`"
  />
</template>

<style lang="sass" scoped>
.block-status
  &__Active
    fill: $green-7
  &__Inactive
    fill: $orange-7
  &__Disabled
    fill: $grey-8
  &__Invalid
    fill: $red-8
  &__null
    fill: none
</style>
