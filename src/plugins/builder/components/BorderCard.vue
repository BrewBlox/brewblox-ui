<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { FlowPart } from '../types';

export default defineComponent({
  name: 'BorderCard',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
    settingsKey: {
      type: String,
      default: 'bordered',
    },
    defaultValue: {
      type: Boolean,
      default: true,
    },
  },
});
</script>

<template>
  <ToggleCard v-bind="{...$attrs, ...$props}" />
</template>
