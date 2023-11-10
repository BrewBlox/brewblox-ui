<script setup lang="ts">
import { createDialog } from '@/utils/dialog';
import { usePart } from '../../composables';

interface Props {
  settingsKey: string;
  label: string;
  message?: string;
}

const props = withDefaults(defineProps<Props>(), {
  message: '',
});

const { settings, patchSettings } = usePart.setup();

function edit(): void {
  createDialog({
    component: 'TextAreaDialog',
    componentProps: {
      modelValue: settings.value[props.settingsKey] ?? '',
      title: props.label,
      message: props.message,
      label: '',
    },
  }).onOk((text) => patchSettings({ [props.settingsKey]: text }));
}
</script>

<template>
  <q-item
    v-close-popup
    clickable
    @click="edit"
  >
    <q-item-section>{{ label }}</q-item-section>
  </q-item>
</template>
