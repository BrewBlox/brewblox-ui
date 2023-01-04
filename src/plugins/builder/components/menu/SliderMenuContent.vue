<script lang="ts">
import { createDialog } from '@/utils/dialog';
import { computed, defineComponent } from 'vue';
import { usePart } from '../../composables';

export default defineComponent({
  name: 'SliderMenuContent',
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
    label: {
      type: String,
      required: true,
    },
  },
  setup(props) {
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

    return {
      settingValue,
      edit,
    };
  },
});
</script>

<template>
  <q-item
    v-close-popup
    clickable
    @click="edit"
  >
    <q-item-section>{{ label }}</q-item-section>
    <q-item-section side> {{ settingValue }} </q-item-section>
  </q-item>
</template>
