<script setup lang="ts">
interface Props {
  available?: boolean;
}

withDefaults(defineProps<Props>(), {
  available: true,
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
