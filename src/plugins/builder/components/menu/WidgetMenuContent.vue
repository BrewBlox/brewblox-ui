<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'WidgetMenuContent',
  props: {
    available: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['show', 'assign'],
});
</script>

<template>
  <q-item
    v-close-popup
    :disable="!available"
    clickable
    @click="$emit('show')"
  >
    <q-item-section>Show widget</q-item-section>
  </q-item>
  <q-item
    v-close-popup
    clickable
    @click="$emit('assign')"
  >
    <q-item-section>Assign widget</q-item-section>
  </q-item>
</template>
