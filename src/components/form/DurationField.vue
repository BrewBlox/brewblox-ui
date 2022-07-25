<script lang="ts">
import { useField } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { isDurationString, isQuantity } from '@/utils/identity';
import { bloxQty, durationString } from '@/utils/quantity';
import { Quantity } from 'brewblox-proto/ts';
import { computed, defineComponent, PropType } from 'vue';

function modelValidator(v: unknown): boolean {
  return isQuantity(v) || isDurationString(v);
}

export default defineComponent({
  name: 'DurationField',
  props: {
    ...useField.props,
    // Duration can be:
    // - Quantity -> bloxQty(10, 'min')
    // - duration string -> '10m'
    // update:modelValue events emitted will match type of value
    // If modelValue is undefined, type is assumed to be string
    modelValue: {
      type: [Object, String] as PropType<Quantity | string>,
      validator: modelValidator,
      default: null,
    },
    label: {
      type: String,
      default: 'duration',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { activeSlots } = useField.setup();

    const isQtyValue = computed<boolean>(() => isQuantity(props.modelValue));

    const displayValue = computed<string>(() =>
      durationString(props.modelValue),
    );

    function save(v: Quantity): void {
      const outputValue = isQtyValue.value ? v : durationString(v);
      emit('update:modelValue', outputValue);
    }

    function openDialog(): void {
      if (props.readonly) {
        return;
      }
      createDialog({
        component: 'DurationQuantityDialog',
        componentProps: {
          modelValue: bloxQty(props.modelValue ?? ''),
          title: props.title,
          message: props.message,
          html: props.html,
          label: props.label,
          rules: props.rules,
        },
      }).onOk(save);
    }

    return {
      activeSlots,
      isQtyValue,
      displayValue,
      save,
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
