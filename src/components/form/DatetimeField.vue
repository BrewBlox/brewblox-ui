<script setup lang="ts">
import { UseFieldProps, useField } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { dateString, shortDateString } from '@/utils/quantity';
import { computed } from 'vue';

interface Props extends UseFieldProps {
  modelValue: Date | null;
  short?: boolean;
  resetIcon?: string;
  label?: string;
  clearLabel?: string;
  defaultNow?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  short: false,
  resetIcon: 'restore',
  label: 'Date and time',
  clearLabel: '<not set>',
  defaultNow: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', data: Date): void;
}>();

const { activeSlots } = useField.setup();

function save(v: Date): void {
  emit('update:modelValue', v);
}

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
  }).onOk(save);
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
