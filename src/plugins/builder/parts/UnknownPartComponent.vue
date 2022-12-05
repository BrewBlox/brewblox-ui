<script lang="ts">
import { defineComponent } from 'vue';
import { usePart } from '../composables';

export default defineComponent({
  name: 'UnknownPartComponent',
  props: { ...usePart.props },
  emits: [...usePart.emits],
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
