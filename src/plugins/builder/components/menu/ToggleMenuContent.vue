<script setup lang="ts">
interface Props {
  modelValue: boolean;
  label: string;
}

defineProps<Props>();

defineEmits<{
  'update:modelValue': [payload: boolean];
}>();
</script>

<template>
  <q-item
    v-ripple
    v-close-popup
    tag="label"
  >
    <q-item-section>
      <q-item-label>{{ label }}</q-item-label>
    </q-item-section>
    <q-item-section side>
      <q-toggle
        :model-value="modelValue"
        @update:model-value="(v) => $emit('update:modelValue', v)"
      />
    </q-item-section>
  </q-item>
</template>
