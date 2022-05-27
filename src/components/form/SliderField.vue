<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { useField } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { fixedNumber } from '@/utils/formatting';

export default defineComponent({
  name: 'SliderField',
  props: {
    ...useField.props,
    modelValue: {
      type: Number,
      default: 0,
    },
    tagClass: {
      type: [String, Array, Object],
      default: '',
    },
    label: {
      type: String,
      default: 'value',
    },
    suffix: {
      type: String,
      default: '',
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    step: {
      type: Number,
      default: 1,
    },
    decimals: {
      type: Number,
      default: 2,
    },
    quickActions: {
      type: Array as PropType<SelectOption[]>,
      default: () => [],
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
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
          decimals: props.decimals,
          min: props.min,
          max: props.max,
          step: props.step,
          quickActions: props.quickActions,
        },
      }).onOk(change);
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
