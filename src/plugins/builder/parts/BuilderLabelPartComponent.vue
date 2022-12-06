<script lang="ts">
import { defineComponent } from 'vue';
import { usePart } from '../composables';

export default defineComponent({
  name: 'BuilderLabelPartComponent',
  props: { ...usePart.props },
});
</script>

<template>
  <BuilderLabelValues
    v-bind="{ ...$props, ...$attrs }"
    settings-key="text"
    unset-label="[click to edit]"
  />
</template>
