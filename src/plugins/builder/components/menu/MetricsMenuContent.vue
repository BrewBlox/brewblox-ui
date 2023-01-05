<script lang="ts">
import { createDialog } from '@/utils/dialog';
import { defineComponent } from 'vue';
import { usePart } from '../../composables';

export default defineComponent({
  name: 'MetricsMenuContent',
  setup() {
    const { part } = usePart.setup();

    function edit(): void {
      createDialog({
        component: 'MetricsEditorDialog',
        componentProps: {
          modelValue: part.value.metrics ?? {},
        },
      }).onOk((metrics) => {
        part.value = { ...part.value, metrics };
      });
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
    <q-item-section>Select metrics</q-item-section>
  </q-item>
</template>
