<script setup lang="ts">
defineOptions({
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
