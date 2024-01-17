<script setup lang="ts">
import { computed } from 'vue';
import { usePart } from '@/plugins/builder/composables';
import { createDialog } from '@/utils/dialog';

interface Props {
  min: AreaSize;
  max: AreaSize;
  default: AreaSize;
}

const props = defineProps<Props>();

const { part, patchPart } = usePart.setup();

const size = computed<AreaSize>(() => ({
  width: part.value.width ?? props.default.width,
  height: part.value.height ?? props.default.height,
}));

function showSizeDialog(): void {
  createDialog({
    component: 'AreaSizeDialog',
    componentProps: {
      title: 'Part size',
      message: 'The part is scaled to fit the new dimensions.',
      modelValue: size.value,
      min: props.min,
      max: props.max,
    },
  }).onOk(({ width, height }: AreaSize) => {
    patchPart({ width, height });
  });
}
</script>

<template>
  <q-item
    v-close-popup
    clickable
    @click="showSizeDialog"
  >
    <q-item-section>Size</q-item-section>
    <q-item-section side> {{ size.width }} x {{ size.height }} </q-item-section>
  </q-item>
</template>
