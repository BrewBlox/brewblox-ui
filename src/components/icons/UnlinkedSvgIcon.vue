<script lang="ts">
import { mdiLinkVariantOff } from '@quasar/extras/mdi-v5';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'UnlinkedSvgIcon',
  props: {
    color: {
      type: String,
      default: 'firebrick',
    },
  },
  setup() {
    return {
      mdiLinkVariantOff,
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
      :d="mdiLinkVariantOff"
      :fill="color"
      stroke="none"
    />
  </svg>
</template>
