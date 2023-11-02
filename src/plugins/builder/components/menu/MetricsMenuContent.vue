<script setup lang="ts">
import { usePart } from '../../composables';
import { emptyMetricsConfig } from '@/plugins/history/utils';
import { createDialog } from '@/utils/dialog';

const { part, patchPart } = usePart.setup();

function edit(): void {
  createDialog({
    component: 'MetricsEditorDialog',
    componentProps: {
      modelValue: part.value.metrics ?? emptyMetricsConfig(),
    },
  }).onOk((metrics) => {
    patchPart({ metrics });
  });
}
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
