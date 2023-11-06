<script setup lang="ts">
defineProps({
  error: {
    type: String,
    default: 'Unknown error',
  },
});
</script>

<template>
  <Card>
    <template #toolbar>
      <WidgetToolbar />
    </template>

    <CardWarning
      color="negative"
      class="items-center"
    >
      <template #message>
        {{ error }}
      </template>
    </CardWarning>
  </Card>
</template>
