<script setup lang="ts">
import { useField, UseFieldProps } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { fixedNumber } from '@/utils/quantity';
import { computed } from 'vue';

export interface Props extends UseFieldProps {
  modelValue: string | number | null;
  type?: 'text' | 'number';
  decimals?: number;
  clearable?: boolean;
  autogrow?: boolean;
  suffix?: string;
}

const props = withDefaults(defineProps<Props>(), {
  ...useField.defaultProps,
  type: 'text',
  decimals: 2,
  clearable: true,
  autogrow: false,
  suffix: '',
});

const emit = defineEmits<{
  'update:modelValue': [data: string | number | null];
}>();

const { activeSlots } = useField.setup();

function change(v: string | number): void {
  emit('update:modelValue', v);
}

const displayValue = computed<string>(() => {
  if (props.modelValue == null || props.modelValue === '') {
    return '<not set>';
  }
  return props.type === 'number'
    ? fixedNumber(Number(props.modelValue), props.decimals)
    : `${props.modelValue}`;
});

function openDialog(): void {
  if (props.readonly) {
    return;
  }

  createDialog({
    component: 'InputDialog',
    componentProps: {
      modelValue: props.modelValue,
      title: props.title,
      message: props.message,
      html: props.html,
      decimals: props.decimals,
      type: props.type,
      label: props.label,
      rules: props.rules,
      clearable: props.clearable,
      autogrow: props.autogrow,
      suffix: props.suffix,
      ...props.editorProps,
    },
  }).onOk(change);
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
