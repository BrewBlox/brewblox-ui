<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Spark2PinsWidget',
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
