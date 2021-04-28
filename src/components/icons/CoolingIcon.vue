<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CoolingIcon',
  props: {
    size: {
      type: String,
      default: '25px',
    },
    color: {
      type: String,
      default: 'white',
    },
    svgProps: {
      type: Object,
      default: () => ({}),
    },
  },
});
</script>

<template>
  <q-icon :size="size" class="static">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="8 8 35 35"
      fill="none"
      :stroke="color"
      v-bind="svgProps"
      stroke-width="1.5px"
    >
      <line x1="25" y1="10" x2="25" y2="40" />
      <polyline points="20.7,12 25,16.7 29.3,12" />
      <polyline points="29.3,38 25,33.3 20.7,38" />
      <line x1="12" y1="17.5" x2="38" y2="32.5" />
      <polyline points="11.6,22.2 17.8,20.8 15.9,14.8" />
      <polyline points="38.4,27.8 32.2,29.2 34.1,35.2" />
      <line x1="12" y1="32.5" x2="38" y2="17.5" />
      <polyline points="15.9,35.2 17.8,29.2 11.6,27.8" />
      <polyline points="34.1,14.8 32.2,20.8 38.4,22.2" />
    </svg>
  </q-icon>
</template>
