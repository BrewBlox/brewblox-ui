<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PowerSvgIcon',
  props: {
    color: {
      type: String,
      default: 'white',
    },
  },
});
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    x="5"
    y="5"
    width="10"
    height="10"
    viewBox="20 10 10 10"
  >
    <path
      stroke-width="1px"
      :stroke="color"
      :fill="color"
      d="M27.7,9.5c-0.7,1.1-1.4,2.2-2.3,3.2c-0.4,0.5-0.8,1-1.2,1.5
        s-0.9,1-1.3,1.4L22.3,14c1.8-0.1,3.6-0.1,5.5,0l2.4,0.1l-1.7,1.5
        c-0.5,0.4-1,0.9-1.4,1.3s-1,0.8-1.5,1.2c-1,0.8-2.1,1.6-3.2,2.3
        c0.7-1.1,1.5-2.2,2.3-3.2c0.4-0.5,0.8-1,1.2-1.5
        c0.4-0.5,0.9-1,1.3-1.4l0.7,1.6c-1.8,0.1-3.6,0.1-5.5,0l-2.3-0.1
        l1.7-1.5c0.5-0.4,1-0.9,1.5-1.3c0.5-0.4,1-0.8,1.5-1.3
        C25.6,10.9,26.6,10.2,27.7,9.5z"
    />
  </svg>
</template>
