<script setup lang="ts">
import { useField } from '@/composables';
import { createDialog } from '@/utils/dialog';
import isArray from 'lodash/isArray';
import { computed, PropType } from 'vue';

const props = defineProps({
  ...useField.props,
  modelValue: {
    type: [Object, String, Number, Symbol] as PropType<any>,
    default: null as any,
  },
  options: {
    type: Array as PropType<any[]>,
    required: true,
  },
  label: {
    type: String,
    default: 'value',
  },
  optionValue: {
    type: String,
    default: 'value',
  },
  optionLabel: {
    type: String,
    default: 'label',
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  listSelect: {
    type: Boolean,
    default: false,
  },
  selectProps: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits<{
  (e: 'update:modelValue', data: object | string | number | symbol): void;
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
