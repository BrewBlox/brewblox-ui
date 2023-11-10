<script setup lang="ts">
import isArray from 'lodash/isArray';
import { computed } from 'vue';
import { createDialog } from '@/utils/dialog';
import { usePart } from '../../composables';

interface Props {
  settingsKey: string;
  title: string;
  label: string;
  message?: string;
  opts: SelectOption[] | (() => SelectOption[]);
  default?: any;
}

const props = withDefaults(defineProps<Props>(), {
  message: '',
  default: null,
});

const { settings, patchSettings } = usePart.setup();

const model = computed(
  () => settings.value[props.settingsKey] ?? props.default,
);

const options = computed<SelectOption[]>(() => {
  if (isArray(props.opts)) {
    return props.opts;
  } else {
    return props.opts();
  }
});

const modelLabel = computed<string>(
  () => options.value.find((opt) => opt.value === model.value)?.label ?? '',
);

function edit(): void {
  createDialog({
    component: 'SelectDialog',
    componentProps: {
      modelValue: model.value,
      title: props.title,
      message: props.message,
      selectOptions: options.value,
      selectProps: {
        label: props.label,
      },
    },
  }).onOk((v) => patchSettings({ [props.settingsKey]: v }));
}
</script>

<template>
  <q-item
    v-close-popup
    clickable
    @click="edit"
  >
    <q-item-section>{{ label }}</q-item-section>
    <q-item-section side> {{ modelLabel }} </q-item-section>
  </q-item>
</template>
