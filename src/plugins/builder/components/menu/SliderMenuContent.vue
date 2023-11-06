<script setup lang="ts">
import { usePart } from '../../composables';
import { createDialog } from '@/utils/dialog';
import { computed } from 'vue';

interface Props {
  settingsKey: string;
  min: number;
  max: number;
  default: number;
  label: string;
  postfix?: string;
}

const props = withDefaults(defineProps<Props>(), {
  postfix: '',
});

const { settings, patchSettings } = usePart.setup();

const settingValue = computed<number>(
  () => settings.value[props.settingsKey] ?? props.default,
);

function edit(): void {
  createDialog({
    component: 'SliderDialog',
    componentProps: {
      modelValue: settingValue.value,
      title: props.label,
      min: props.min,
      max: props.max,
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
    <q-item-section side> {{ settingValue }} {{ postfix }} </q-item-section>
  </q-item>
</template>
