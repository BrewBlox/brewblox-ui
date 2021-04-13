<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'KeyboardButton',
});
</script>

<template>
  <q-icon
    name="mdi-keyboard"
    class="pointer q-mx-xs"
    v-bind="$attrs"
  >
    <q-tooltip>Open keyboard</q-tooltip>
  </q-icon>
</template>
