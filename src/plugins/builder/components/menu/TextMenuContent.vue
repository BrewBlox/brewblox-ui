<script lang="ts">
import { createDialog } from '@/utils/dialog';
import { defineComponent } from 'vue';
import { usePart } from '../../composables';

export default defineComponent({
  name: 'TextMenuContent',
  props: {
    settingsKey: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { settings, patchSettings } = usePart.setup();

    function edit(): void {
      createDialog({
        component: 'TextAreaDialog',
        componentProps: {
          modelValue: settings.value[props.settingsKey] ?? '',
          title: props.label,
          label: '',
        },
      }).onOk((text) => patchSettings({ [props.settingsKey]: text }));
    }

    return {
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
  </q-item>
</template>
