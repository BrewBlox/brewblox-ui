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
    r="4"
    :class="`block-status__${status}`"
  />
</template>

<style lang="sass" scoped>
.block-status
  &__Active
    fill: $green-7
  &__Inactive
    fill: $warning
  &__Disabled
    fill: $grey-6
  &__Invalid
    fill: $negative
  &__null
    fill: none
</style>
