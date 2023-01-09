<script lang="ts">
import { createDialog } from '@/utils/dialog';
import { computed, defineComponent } from 'vue';
import { usePart } from '../../composables';
import { MAX_IO_PRESSURE } from '../../const';

export default defineComponent({
  name: 'PressureMenuContent',
  props: {
    settingsKey: {
      type: String,
      required: true,
    },
    min: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      required: true,
    },
    default: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
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

    return {
      MAX_IO_PRESSURE,
      pressure,
      editPressure,
    };
  },
});
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
