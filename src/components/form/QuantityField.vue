<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { useField } from '@/composables';
import { Quantity } from '@/shared-types';
import { createDialog } from '@/utils/dialog';
import { fixedNumber, prettyUnit } from '@/utils/formatting';
import { isQuantity } from '@/utils/identity';

export default defineComponent({
  name: 'QuantityField',
  props: {
    ...useField.props,
    modelValue: {
      type: Object as PropType<Quantity>,
      required: true,
      validator: isQuantity,
    },
    label: {
      type: String,
      default: '',
    },
    noLabel: {
      type: Boolean,
      default: false,
    },
    tagClass: {
      type: [String, Object, Array],
      default: '',
    },
    decimals: {
      type: Number,
      default: 2,
    },
    unitTag: {
      type: String,
      default: 'small',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { activeSlots } = useField.setup();

    function change(v: Quantity): void {
      emit('update:modelValue', v);
    }

    const displayValue = computed<string>(() =>
      fixedNumber(props.modelValue.value, props.decimals),
    );

    const displayUnit = computed<string>(() => prettyUnit(props.modelValue));

    function openDialog(): void {
      if (props.readonly) {
        return;
      }
      createDialog({
        component: 'QuantityDialog',
        componentProps: {
          modelValue: props.modelValue,
          title: props.title,
          message: props.message,
          html: props.html,
          label: props.label,
        },
      }).onOk(change);
    }

    return {
      activeSlots,
      displayValue,
      displayUnit,
      openDialog,
    };
  },
});
</script>

<template>
  <LabeledField v-bind="{ ...$attrs, ...$props }" @click="openDialog">
    <slot name="value">
      {{ displayValue }}
    </slot>
    <component
      :is="unitTag"
      v-if="modelValue.value !== null"
      class="self-end darkish"
    >
      {{ displayUnit }}
    </component>

    <template v-for="slot in activeSlots" #[slot]>
      <slot :name="slot" />
    </template>
  </LabeledField>
</template>
