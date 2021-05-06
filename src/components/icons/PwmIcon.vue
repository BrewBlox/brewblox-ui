<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PwmIcon',
  props: {
    size: {
      type: String,
      default: '25px',
    },
    color: {
      type: String,
      default: 'white',
    },
  },
});
</script>

<template>
  <q-icon :size="size" class="static">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 50 50"
      stroke-width="3.5px"
      fill="none"
      :stroke="color"
    >
      <path d="M5,35 h5 v-18 h10 v18 h10 v-18 h10 v18 H45" />
    </svg>
  </q-icon>
</template>
