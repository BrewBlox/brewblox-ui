<script setup lang="ts">
import { useLoggingStore } from '@/store/logging';
import { saveFile } from '@/utils/import-export';

defineProps({
  icon: {
    type: String,
    default: 'mdi-file-export',
  },
  label: {
    type: String,
    default: 'Export UI logs',
  },
});

const loggingStore = useLoggingStore();

async function startExport(): Promise<void> {
  const logs = loggingStore.entries;
  saveFile(JSON.stringify(logs, null, 2), 'brewblox-logs.json', true);
}
</script>

<template>
  <ActionItem
    v-bind="{ ...$attrs, icon, label }"
    @click="startExport"
  />
</template>
