<script lang="ts">
import { createDialog } from '@/utils/dialog';
import { defineComponent } from 'vue';
import { usePart } from '../../composables';
import { LABEL_KEY } from '../../const';

export default defineComponent({
  name: 'TextMenuContent',
  setup() {
    const { settings, patchSettings } = usePart.setup();

    function edit(): void {
      createDialog({
        component: 'InputDialog',
        componentProps: {
          modelValue: settings.value[LABEL_KEY] ?? '',
          title: 'Edit label',
          label: 'text',
        },
      }).onOk((text) => patchSettings({ [LABEL_KEY]: text }));
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
    <q-item-section>Edit text</q-item-section>
  </q-item>
</template>
