<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: boolean;
  colored?: boolean;
  iconEnabled?: string;
  iconDisabled?: string;
}

const props = withDefaults(defineProps<Props>(), {
  colored: true,
  iconEnabled: 'mdi-checkbox-marked-outline',
  iconDisabled: 'mdi-checkbox-blank-outline',
});

defineEmits<{
  'update:modelValue': [data: boolean];
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
