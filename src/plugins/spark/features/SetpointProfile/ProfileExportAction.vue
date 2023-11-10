<script setup lang="ts">
import { SetpointProfileBlock } from 'brewblox-proto/ts';
import { useBlockWidget } from '@/plugins/spark/composables';
import { saveFile } from '@/utils/import-export';

interface Props {
  icon?: string;
  label?: string;
}

withDefaults(defineProps<Props>(), {
  icon: 'mdi-file-export',
  label: 'Export profile to file',
});

const { block } = useBlockWidget.setup<SetpointProfileBlock>();

function startExport(): void {
  const { points } = block.value.data;
  saveFile(
    { points },
    `${block.value.serviceId}-${block.value.id}.profile.json`,
  );
}
</script>

<template>
  <ActionItem
    v-bind="{ ...$attrs, ...$props }"
    @click="startExport"
  />
</template>
