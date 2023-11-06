<script setup lang="ts">
import { useField, UseFieldProps } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { fixedNumber } from '@/utils/quantity';
import { computed } from 'vue';

export interface Props extends UseFieldProps {
  modelValue: number | null;
  decimals?: number;
  clearable?: boolean;
  autogrow?: boolean;
  suffix?: string;
}

const props = withDefaults(defineProps<Props>(), {
  ...useField.defaultProps,
  decimals: 2,
  clearable: true,
  autogrow: false,
  suffix: '',
});

const emit = defineEmits<{
  'update:modelValue': [data: number | null];
}>();

const { activeSlots } = useField.setup();

const displayValue = computed<string>(() => {
  if (props.modelValue == null) {
    return '<not set>';
  }
  return fixedNumber(props.modelValue, props.decimals);
});

function openDialog(): void {
  if (props.readonly) {
    return;
  }

  createDialog({
    component: 'NumberDialog',
    componentProps: {
      modelValue: props.modelValue,
      title: props.title,
      message: props.message,
      html: props.html,
      decimals: props.decimals,
      label: props.label,
      rules: props.rules,
      clearable: props.clearable,
      autogrow: props.autogrow,
      suffix: props.suffix,
      ...props.dialogProps,
    },
  }).onOk((v) => emit('update:modelValue', v));
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
