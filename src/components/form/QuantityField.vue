<script setup lang="ts">
import { UseFieldProps, useField } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { fixedNumber, prettyUnit } from '@/utils/quantity';
import { Quantity } from 'brewblox-proto/ts';
import { VueClassProp } from 'quasar';
import { computed } from 'vue';

interface Props extends UseFieldProps {
  modelValue: Quantity;
  backupValue?: Quantity | null;
  noLabel?: boolean;
  tagClass?: VueClassProp;
  decimals?: number;
  unitTag?: string;
}

const props = withDefaults(defineProps<Props>(), {
  ...useField.defaultProps,
  backupValue: null,
  label: '',
  noLabel: false,
  tagClass: '',
  decimals: 2,
  unitTag: 'small',
});

const emit = defineEmits<{
  'update:modelValue': [data: Quantity];
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
