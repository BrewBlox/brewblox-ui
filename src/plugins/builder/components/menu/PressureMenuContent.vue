<script setup lang="ts">
import { computed } from 'vue';
import { createDialog } from '@/utils/dialog';
import { usePart } from '../../composables';

interface Props {
  settingsKey: string;
  min: number;
  max: number;
  default: number;
}

const props = defineProps<Props>();

const { settings, patchSettings } = usePart.setup();

const pressure = computed<number>(
  () => settings.value[props.settingsKey] ?? props.default,
);

function editPressure(): void {
  createDialog({
    component: 'SliderDialog',
    componentProps: {
      modelValue: pressure.value,
      title: 'Liquid pressure',
      message:
        'Liquid flow speed is based on source pressure, pump pressure, and flow distance.',
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
    @click="editPressure"
  >
    <q-item-section>Pressure</q-item-section>
    <q-item-section side> {{ pressure }} / {{ max }} </q-item-section>
  </q-item>
</template>
