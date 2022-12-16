<script lang="ts">
import { mdiAlertCircleOutline } from '@quasar/extras/mdi-v5';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BrokenSvgIcon',
  props: {
    color: {
      type: String,
      default: 'firebrick',
    },
  },
  setup() {
    return {
      mdiAlertCircleOutline,
    };
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
      :d="mdiAlertCircleOutline"
      :fill="color"
      stroke="none"
    />
  </svg>
</template>
