<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BuilderLabelPartComponent',
});
</script>

<template>
  <BuilderLabelValues
    v-bind="$attrs"
    settings-key="text"
    unset-label="[click to edit]"
  />
</template>
