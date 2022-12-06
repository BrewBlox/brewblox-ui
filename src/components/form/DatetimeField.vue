<script lang="ts">
import { useField } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { dateString, shortDateString } from '@/utils/quantity';
import { computed, defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'DatetimeField',
  props: {
    ...useField.props,
    modelValue: {
      type: null as unknown as PropType<Date | null>,
      default: null,
    },
    short: {
      type: Boolean,
      default: false,
    },
    resetIcon: {
      type: String,
      default: 'restore',
    },
    label: {
      type: String,
      default: 'Date and time',
    },
    clearLabel: {
      type: String,
      default: '<not set>',
    },
    defaultNow: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { activeSlots } = useField.setup();

    function save(v: Date | null): void {
      emit('update:modelValue', v);
    }

    const displayValue = computed<string>(() =>
      props.short
        ? shortDateString(props.modelValue, props.clearLabel)
        : dateString(props.modelValue, props.clearLabel),
    );

    function openDialog(): void {
      if (props.readonly) {
        return;
      }

      const date =
        props.modelValue == null && props.defaultNow
          ? new Date()
          : props.modelValue;

      createDialog({
        component: 'DatetimeDialog',
        componentProps: {
          modelValue: date,
          title: props.title,
          message: props.message,
          html: props.html,
          label: props.label,
          resetIcon: props.resetIcon,
          rules: props.rules,
        },
      }).onOk(save);
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
