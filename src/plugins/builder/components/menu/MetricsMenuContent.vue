<script setup lang="ts">
import defaults from 'lodash/defaults';
import { emptyMetricsConfig } from '@/plugins/history/utils';
import { createDialog } from '@/utils/dialog';
import { usePart } from '../../composables';

const { part, patchPart } = usePart.setup();

function edit(): void {
  createDialog({
    component: 'MetricsEditorDialog',
    componentProps: {
      modelValue: defaults(emptyMetricsConfig(), part.value.metrics),
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
