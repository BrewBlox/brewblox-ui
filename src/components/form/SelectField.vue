<script setup lang="ts">
import { useField, UseFieldProps } from '@/composables';
import { createDialog } from '@/utils/dialog';
import isArray from 'lodash/isArray';
import { computed } from 'vue';

interface Props extends UseFieldProps {
  modelValue: any;
  options: any[];
  optionValue?: string;
  optionLabel?: string;
  clearable?: boolean;
  listSelect?: boolean;
  selectProps?: AnyDict;
}

const props = withDefaults(defineProps<Props>(), {
  ...useField.defaultProps,
  label: 'value',
  optionValue: 'value',
  optionLabel: 'label',
  clearable: false,
  listSelect: false,
  selectProps: () => ({}),
});

const emit = defineEmits<{
  'update:modelValue': [payload: any];
}>();

const { activeSlots } = useField.setup();

const displayValue = computed<string>(() => {
  if (props.selectProps.multiple) {
    if (!isArray(props.modelValue)) {
      return `Invalid value: ${props.modelValue}`;
    }

    const text = props.modelValue
      .map((v: any) =>
        props.options.find((opt: any) => opt[props.optionValue] === v),
      )
      .map((v: any) => v[props.optionLabel])
      .join(', ');
    return text || 'Click to set';
  }

  for (const opt of props.options) {
    if (opt === props.modelValue) {
      return opt;
    }
    if (opt[props.optionValue] === props.modelValue) {
      return opt[props.optionLabel];
    }
  }

  return 'Click to set';
});

function change(v: any): void {
  emit('update:modelValue', v);
}

function openDialog(): void {
  if (props.readonly) {
    return;
  }

  createDialog({
    component: 'SelectDialog',
    componentProps: {
      modelValue: props.modelValue,
      title: props.title,
      message: props.message,
      html: props.html,
      listSelect: props.listSelect,
      selectOptions: props.options,
      selectProps: {
        ...props.selectProps,
        label: props.label,
        optionLabel: props.optionLabel,
        optionValue: props.optionValue,
        clearable: props.clearable,
      },
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
