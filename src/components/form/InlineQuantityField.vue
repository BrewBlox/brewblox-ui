<script setup lang="ts">
import { useField, UseFieldProps } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { prettyQty } from '@/utils/quantity';
import { Quantity } from 'brewblox-proto/ts';
import { computed } from 'vue';

interface Props extends UseFieldProps {
  modelValue: Quantity;
  decimals?: number;
}

const props = withDefaults(defineProps<Props>(), {
  ...useField.defaultProps,
  label: '',
  decimals: 2,
});

const emit = defineEmits<{
  'update:modelValue': [data: Quantity];
}>();

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
