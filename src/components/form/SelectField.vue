<script lang="ts">
import isArray from 'lodash/isArray';
import { computed, defineComponent, PropType } from 'vue';

import { useField } from '@/composables';
import { createDialog } from '@/utils';

export default defineComponent({
  name: 'SelectField',
  props: {
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
  },
  emits: [
    'update:modelValue',
  ],
  setup(props, { emit }) {
    const { activeSlots } = useField.setup();

    const displayValue = computed<string>(
      () => {
        if (props.selectProps.multiple) {
          if (!isArray(props.modelValue)) {
            return `Invalid value: ${props.modelValue}`;
          }

          const text = props.modelValue
            .map((v: any) => props.options.find((opt: any) => opt[props.optionValue] === v))
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
      },
    );

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
            label: props.label,
            optionLabel: props.optionLabel,
            optionValue: props.optionValue,
            clearable: props.clearable,
          },
        },
      })
        .onOk(change);
    }

    return {
      activeSlots,
      displayValue,
      openDialog,
    };
  },
});
</script>

<template>
  <LabeledField v-bind="{...$attrs, ...$props}" @click="openDialog">
    <slot name="value">
      {{ displayValue }}
    </slot>

    <template v-for="slot in activeSlots" #[slot] :name="slot">
      <slot :name="slot" />
    </template>
  </LabeledField>
</template>
