<script setup lang="ts">
import { Quantity } from 'brewblox-proto/ts';
import { computed } from 'vue';
import { useField, UseFieldProps } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { durationString } from '@/utils/quantity';

const model = defineModel<Quantity>({ required: true });

const props = withDefaults(defineProps<UseFieldProps>(), {
  ...useField.defaultProps,
});

const { activeSlots } = useField.setup();

const displayValue = computed<string>(() => durationString(model.value));

function openDialog(): void {
  if (props.readonly) {
    return;
  }
  createDialog({
    component: 'DurationDialog',
    componentProps: {
      modelValue: model.value,
      title: props.title,
      message: props.message,
      html: props.html,
      label: props.label,
      rules: props.rules,
    },
  }).onOk((v: Quantity) => {
    model.value = v;
  });
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
    <template
      v-for="slot in activeSlots"
      #[slot]
    >
      <slot :name="slot" />
    </template>
  </LabeledField>
</template>
