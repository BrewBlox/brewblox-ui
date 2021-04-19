<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { useField } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { round } from '@/utils/functional';

export default defineComponent({
  name: 'InputField',
  props: {
    ...useField.props,
    modelValue: {
      type: [String, Number],
      default: null,
    },
    type: {
      type: String as PropType<'text' | 'number'>,
      default: 'text',
    },
    decimals: {
      type: Number,
      default: 2,
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    autogrow: {
      type: Boolean,
      default: false,
    },
    suffix: {
      type: String,
      default: '',
    },
  },
  emits: [
    'update:modelValue',
  ],
  setup(props, { emit }) {
    const { activeSlots } = useField.setup();

    function change(v: string | number): void {
      emit('update:modelValue', v);
    }

    const displayValue = computed<string>(
      () => {
        if (props.modelValue == null || props.modelValue === '') {
          return '<not set>';
        }
        return props.type === 'number'
          ? round(Number(props.modelValue), props.decimals)
          : `${props.modelValue}`;
      },
    );

    function openDialog(): void {
      debugger;
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
    <template v-for="slot in activeSlots" #[slot] :name="slot" />
  </LabeledField>
</template>
