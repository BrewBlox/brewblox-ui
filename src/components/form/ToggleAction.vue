<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  colored: {
    type: Boolean,
    default: true,
  },
  iconEnabled: {
    type: String,
    default: 'mdi-checkbox-marked-outline',
  },
  iconDisabled: {
    type: String,
    default: 'mdi-checkbox-blank-outline',
  },
});

defineEmits<{
  (e: 'update:modelValue', data: boolean): void;
}>();

const icon = computed<string>(() =>
  props.modelValue ? props.iconEnabled : props.iconDisabled,
);

const color = computed<string>(() => (props.modelValue ? 'primary' : 'white'));
</script>

<template>
  <ActionItem
    :icon="icon"
    :class="colored && `text-${color}`"
    @click="$emit('update:modelValue', !modelValue)"
  />
</template>
