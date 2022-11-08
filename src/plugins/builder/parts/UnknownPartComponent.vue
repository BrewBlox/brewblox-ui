<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { FlowPart } from '../types';

export default defineComponent({
  name: 'UnknownPartComponent',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
});
</script>

<template>
  <text
    x="5"
    y="5"
  >
    ??
  </text>
</template>
