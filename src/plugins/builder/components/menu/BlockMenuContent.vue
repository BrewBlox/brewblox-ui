<script setup lang="ts">
defineProps({
  available: {
    type: Boolean,
    default: true,
  },
});

defineEmits<{
  show: [];
  assign: [];
}>();
</script>

<template>
  <q-item
    v-close-popup
    :disable="!available"
    clickable
    @click="$emit('show')"
  >
    <q-item-section>Show block</q-item-section>
  </q-item>
  <q-item
    v-close-popup
    clickable
    @click="$emit('assign')"
  >
    <q-item-section>Assign block</q-item-section>
  </q-item>
</template>
