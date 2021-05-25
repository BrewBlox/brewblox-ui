<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'InvalidWidget',
  props: {
    error: {
      type: String,
      default: 'Unknown error',
    },
  },
});
</script>

<template>
  <Card>
    <template #toolbar>
      <WidgetToolbar />
    </template>

    <CardWarning color="negative" class="items-center">
      <template #message>
        {{ error }}
      </template>
    </CardWarning>
  </Card>
</template>
