<script lang="ts">
import { defineComponent } from 'vue';
import { usePart } from '../composables';

export default defineComponent({
  name: 'BuilderLabelPartComponent',
  setup() {
    const { width, height } = usePart.setup();
    return {
      width,
      height,
    };
  },
});
</script>

<template>
  <BuilderLabelValues
    v-bind="{ width, height }"
    unset-label="[click to edit]"
  />
</template>
