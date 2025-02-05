<script setup lang="ts">
import { computed } from 'vue';
import { useField, UseFieldProps } from '@/composables';
import { createDialog } from '@/utils/dialog';

export interface Props extends UseFieldProps {
  modelValue: number | null;
  fractionDigits?: number;
  clearable?: boolean;
  autogrow?: boolean;
  suffix?: string;
  dialogSuffix?: string;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  ...useField.defaultProps,
  fractionDigits: 4,
  clearable: true,
  autogrow: false,
  suffix: '',
  placeholder: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [payload: number];
}>();

const { activeSlots } = useField.setup();

const displayValue = computed<string>(() =>
 Number.parseFloat(props.modelValue).toExponential(props.fractionDigits),
);

function openDialog(): void {
  if (props.readonly) {
    return;
  }

  createDialog({
    component: 'ScientificNumberDialog',
    componentProps: {
      modelValue: props.modelValue,
      title: props.title,
      message: props.message,
      html: props.html,
      fractionDigits: props.fractionDigits,
      label: props.label,
      rules: props.rules,
      clearable: props.clearable,
      autogrow: props.autogrow,
      suffix: props.dialogSuffix || props.suffix,
      placeholder: props.placeholder,
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
