<script setup lang="ts">
import { useField } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { isQuantity } from '@/utils/identity';
import { fixedNumber, prettyUnit } from '@/utils/quantity';
import { Quantity } from 'brewblox-proto/ts';
import { computed, PropType } from 'vue';

const props = defineProps({
  ...useField.props,
  modelValue: {
    type: Object as PropType<Quantity>,
    required: true,
    validator: isQuantity,
  },
  backupValue: {
    type: Object as PropType<Quantity>,
    default: null,
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
});

const emit = defineEmits<{
  (e: 'update:modelValue', data: Quantity): void;
}>();

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

  const modelValue =
    props.modelValue.value == null && props.backupValue != null
      ? props.backupValue
      : props.modelValue;

  createDialog({
    component: 'QuantityDialog',
    componentProps: {
      modelValue,
      title: props.title,
      message: props.message,
      html: props.html,
      label: props.label,
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
    <component
      :is="unitTag"
      v-if="modelValue.value !== null"
      class="self-end darkish q-ml-xs"
    >
      {{ displayUnit }}
    </component>

    <template
      v-for="slot in activeSlots"
      #[slot]
    >
      <slot :name="slot" />
    </template>
  </LabeledField>
</template>
