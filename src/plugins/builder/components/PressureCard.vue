<script lang="ts">
import { debounce } from 'quasar';
import { computed, defineComponent, PropType } from 'vue';

import { FlowPart } from '../types';

export default defineComponent({
  name: 'PressureCard',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
    settingsKey: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: 'Pressure',
    },
    defaultValue: {
      type: Number,
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
  },
  emits: [
    'update:part',
  ],
  setup(props, { emit }) {
    const value = computed<number>(
      () => props.part.settings[props.settingsKey] ?? props.defaultValue,
    );

    const save = debounce((v: number | null): void => {
      const pressure = v ?? props.defaultValue;
      emit('update:part', {
        ...props.part,
        settings: {
          ...props.part.settings,
          [props.settingsKey]: pressure,
        },
      });
    }, 50, true);

    return {
      value,
      save,
    };
  },
});
</script>

<template>
  <q-item class="q-ma-none q-mt-xs">
    <q-item-section>
      <q-item-label caption>
        {{ label }}
      </q-item-label>
      <q-slider :model-value="value" :min="min" :max="max" @change="save" />
    </q-item-section>
    <q-item-section class="col-auto">
      <q-btn icon="mdi-backup-restore" flat round size="sm" @click="save(null)">
        <q-tooltip>
          Reset to default
        </q-tooltip>
      </q-btn>
    </q-item-section>
  </q-item>
</template>
