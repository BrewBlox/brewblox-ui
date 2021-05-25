<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'UnlinkedIcon',
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
    name="mdi-link-variant-off"
    color="warning"
    :size="size"
    class="static"
  />
</template>
