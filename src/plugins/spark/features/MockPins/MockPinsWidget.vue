<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MockPinsWidget',
});
</script>

<template>
  <CardWrapper>
    <template #toolbar>
      <BlockWidgetToolbar />
    </template>
    <div class="widget-md">
      <IoArray />
    </div>
  </CardWrapper>
</template>
