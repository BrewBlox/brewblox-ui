<script setup lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MockPinsWidget',
});
</script>

<template>
  <Card>
    <template #toolbar>
      <BlockWidgetToolbar />
    </template>
    <div>
      <IoArray />
    </div>
  </Card>
</template>
