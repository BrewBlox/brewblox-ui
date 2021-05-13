<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TitleTeleport',
});
</script>

<template>
  <portal to="toolbar-title">
    <slot />
  </portal>
</template>
