<script setup lang="ts">
import { UseFieldProps, useField } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { durationString } from '@/utils/quantity';
import { Quantity } from 'brewblox-proto/ts';
import { computed } from 'vue';

interface Props extends UseFieldProps {
  modelValue: Quantity;
}

const props = withDefaults(defineProps<Props>(), {
  ...useField.defaultProps,
});

const emit = defineEmits<{
  'update:modelValue': [payload: Quantity];
}>();

const { activeSlots } = useField.setup();

const displayValue = computed<string>(() => durationString(props.modelValue));

function openDialog(): void {
  if (props.readonly) {
    return;
  }
  createDialog({
    component: 'DurationDialog',
    componentProps: {
      modelValue: props.modelValue,
      title: props.title,
      message: props.message,
      html: props.html,
      label: props.label,
      rules: props.rules,
    },
  }).onOk((v: Quantity) => emit('update:modelValue', v));
}
</script>

<template>
  <LabeledField
    v-bind="{ ...$attrs, ...$props }"
    @click="openDialog"
  >
    <slot name="value">
      {{ displayValue }}
    </slot>
    <template
      v-for="slot in activeSlots"
      #[slot]
    >
      <slot :name="slot" />
    </template>
  </LabeledField>
</template>
