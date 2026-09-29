<script setup lang="ts">
import { computed } from 'vue';
import { createDialog } from '@/utils/dialog';
import { usePart } from '../../composables';

interface Props {
  settingsKey: string;
  min: number;
  max: number;
  default: number;
  /** Added to the dialog's explanation */
  note?: string;
}

const props = withDefaults(defineProps<Props>(), {
  note: '',
});

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
      message: [
        'Only affects the flow animation.',
        'Liquid flows faster with more pressure and over shorter distances.',
        props.note,
      ]
        .filter(Boolean)
        .join(' '),
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
    <q-item-section>
      <q-item-label>Pressure</q-item-label>
      <q-item-label caption>Only affects the flow animation</q-item-label>
    </q-item-section>
    <q-item-section side> {{ pressure }} / {{ max }} </q-item-section>
  </q-item>
</template>
