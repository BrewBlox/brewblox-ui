<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ToggleMenuContent',
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
  emits: ['update:modelValue'],
});
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
