<script setup lang="ts">
import { useField, UseFieldProps } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { computed } from 'vue';

export interface Props extends UseFieldProps {
  modelValue: string | null;
  clearable?: boolean;
  autogrow?: boolean;
  suffix?: string;
}

const props = withDefaults(defineProps<Props>(), {
  ...useField.defaultProps,
  clearable: true,
  autogrow: false,
  suffix: '',
});

const emit = defineEmits<{
  'update:modelValue': [data: string | null];
}>();

const { activeSlots } = useField.setup();

const displayValue = computed<string>(() => {
  if (props.modelValue == null || props.modelValue === '') {
    return '<not set>';
  }
  return props.modelValue;
});

function openDialog(): void {
  if (props.readonly) {
    return;
  }

  createDialog({
    component: 'TextDialog',
    componentProps: {
      modelValue: props.modelValue,
      title: props.title,
      message: props.message,
      html: props.html,
      label: props.label,
      rules: props.rules,
      clearable: props.clearable,
      autogrow: props.autogrow,
      suffix: props.suffix,
      ...props.editorProps,
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
