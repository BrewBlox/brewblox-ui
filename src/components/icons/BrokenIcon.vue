<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BrokenIcon',
  props: {
    size: {
      type: String,
      default: '40px',
    },
  },
});
</script>

<template>
  <q-icon
    name="mdi-alert-circle-outline"
    color="negative"
    :size="size"
    class="static"
  />
</template>
