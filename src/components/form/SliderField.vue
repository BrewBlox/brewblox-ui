<script setup lang="ts">
import { useField, UseFieldProps } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { fixedNumber } from '@/utils/quantity';
import { computed } from 'vue';

interface Props extends UseFieldProps {
  modelValue: number;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  decimals?: number;
  quickActions?: SelectOption[];
}

const props = withDefaults(defineProps<Props>(), {
  ...useField.defaultProps,
  label: 'value',
  suffix: '',
  min: 0,
  max: 100,
  step: 1,
  decimals: 2,
  quickActions: () => [],
});

const emit = defineEmits<{
  'update:modelValue': [data: number];
}>();

const { activeSlots } = useField.setup();

function change(v: number): void {
  emit('update:modelValue', v);
}

const displayValue = computed<string>(() =>
  fixedNumber(props.modelValue, props.decimals),
);

function openDialog(): void {
  if (props.readonly) {
    return;
  }

  createDialog({
    component: 'SliderDialog',
    componentProps: {
      modelValue: props.modelValue,
      title: props.title,
      label: props.label,
      message: props.message,
      html: props.html,
      min: props.min,
      max: props.max,
      step: props.step,
      quickActions: props.quickActions,
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
