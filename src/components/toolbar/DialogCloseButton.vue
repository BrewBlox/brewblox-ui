<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DialogCloseButton',
});
</script>

<template>
  <q-btn v-close-popup flat icon="mdi-close-circle" />
</template>
