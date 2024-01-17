<script setup lang="ts">
import { computed } from 'vue';
import { useField, UseFieldProps } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { dateString, shortDateString } from '@/utils/quantity';

interface Props extends UseFieldProps {
  modelValue: Date | null;
  short?: boolean;
  resetIcon?: string;
  clearLabel?: string;
  defaultNow?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  ...useField.defaultProps,
  short: false,
  resetIcon: 'restore',
  label: 'Date and time',
  clearLabel: '<not set>',
  defaultNow: false,
});

const emit = defineEmits<{
  'update:modelValue': [payload: Date];
}>();

const { activeSlots } = useField.setup();

const displayValue = computed<string>(() =>
  props.short
    ? shortDateString(props.modelValue, props.clearLabel)
    : dateString(props.modelValue, props.clearLabel),
);

function openDialog(): void {
  if (props.readonly) {
    return;
  }

  const date =
    props.modelValue == null && props.defaultNow
      ? new Date()
      : props.modelValue;

  if (date == null) {
    return;
  }

  createDialog({
    component: 'DatetimeDialog',
    componentProps: {
      modelValue: date,
      title: props.title,
      message: props.message,
      html: props.html,
      label: props.label,
      resetIcon: props.resetIcon,
      rules: props.rules,
    },
  }).onOk((v: Date) => emit('update:modelValue', v));
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
