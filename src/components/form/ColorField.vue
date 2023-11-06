<script setup lang="ts">
import { useField, UseFieldProps } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { computed, CSSProperties } from 'vue';

interface Props extends UseFieldProps {
  modelValue: string | null;
  nullText?: string;
  presets: string[];
}

const props = withDefaults(defineProps<Props>(), {
  ...useField.defaultProps,
  clearable: false,
  nullText: '<not set>',
  presets: () => [],
});

const emit = defineEmits<{
  'update:modelValue': [data: string | null];
}>();

const { activeSlots } = useField.setup();

const color = computed<string>(() => {
  const c = props.modelValue || '#ffffff';
  return c.startsWith('#') ? c : `#${c}`;
});

const colorDesc = computed<string>(() =>
  !!props.modelValue ? color.value : props.nullText,
);

const colorStyle = computed<CSSProperties>(() => ({
  color: color.value,
  backgroundColor: props.modelValue ? color.value : undefined,
  border: `1px ${props.modelValue ? 'solid' : 'dashed'} ${color.value}`,
  borderRadius: '50%',
  height: '20px',
  width: '20px',
  display: 'inline-block',
}));

function change(c: string | null): void {
  emit('update:modelValue', c?.replace('#', '') ?? props.clearable ? null : '');
}

function openDialog(): void {
  if (props.readonly) {
    return;
  }

  createDialog({
    component: 'ColorDialog',
    componentProps: {
      modelValue: color.value,
      title: props.title,
      message: props.message,
      html: props.html,
      clearable: props.clearable,
      presets: props.presets,
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
      {{ colorDesc }}
    </slot>
    <template #after>
      <slot name="indicator">
        <span
          class="self-end q-mb-sm"
          :style="colorStyle"
        />
      </slot>
    </template>

    <template
      v-for="slot in activeSlots"
      #[slot]
    >
      <slot :name="slot" />
    </template>
  </LabeledField>
</template>
