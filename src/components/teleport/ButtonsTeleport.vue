<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ButtonsTeleport',
});
</script>

<template>
  <portal to="toolbar-buttons">
    <slot />
  </portal>
</template>
