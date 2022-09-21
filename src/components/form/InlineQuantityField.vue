<script lang="ts">
import { useField } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { isQuantity } from '@/utils/identity';
import { prettyQty } from '@/utils/quantity';
import { Quantity } from 'brewblox-proto/ts';
import { computed, defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'InlineQuantityField',
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
    decimals: {
      type: Number,
      default: 2,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const displayValue = computed<string>(() =>
      prettyQty(props.modelValue, props.decimals),
    );

    function change(v: Quantity): void {
      emit('update:modelValue', v);
    }

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
      displayValue,
      openDialog,
    };
  },
});
</script>

<template>
  <span
    class="clickable q-pa-sm q-ma-xs rounded-borders text-bold"
    style="line-height: 200%"
    @click="openDialog"
  >
    {{ displayValue }}
  </span>
</template>
