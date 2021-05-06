<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SleepingIcon',
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
    name="mdi-sleep"
    color="warning"
    :size="size"
    class="static"
  />
</template>
