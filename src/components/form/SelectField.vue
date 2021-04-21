<script lang="ts">
import { isArray } from 'lodash';
import { computed, defineComponent, PropType } from 'vue';

import { useField } from '@/composables';
import { createDialog } from '@/utils/dialog';

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
    optionsValue: {
      type: String,
      default: 'value',
    },
    optionsLabel: {
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
            .map((v: any) => props.options.find((opt: any) => opt[props.optionsValue] === v))
            .map((v: any) => v[props.optionsLabel])
            .join(', ');
          return text || 'Click to set';
        }

        for (const opt of props.options) {
          if (opt === props.modelValue) {
            return opt;
          }
          if (opt[props.optionsValue] === props.modelValue) {
            return opt[props.optionsLabel];
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
            optionsLabel: props.optionsLabel,
            optionsValue: props.optionsValue,
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
