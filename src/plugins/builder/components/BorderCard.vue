<script lang="ts">
import { defineComponent } from 'vue';
import { BORDER_KEY } from '../const';

export default defineComponent({
  name: 'BorderCard',
  props: {
    settingsKey: {
      type: String,
      default: BORDER_KEY,
    },
    label: {
      type: String,
      default: 'Show border',
    },
    defaultValue: {
      type: Boolean,
      default: true,
    },
  },
});
</script>

<template>
  <ToggleCard v-bind="{ settingsKey, label, defaultValue }" />
</template>
