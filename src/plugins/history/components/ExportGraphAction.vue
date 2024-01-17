<script setup lang="ts">
import { useHistoryStore } from '@/plugins/history/store';
import { GraphConfig } from '@/plugins/history/types';
import { selectGraphPrecision } from '@/plugins/history/utils';
import { notify } from '@/utils/notify';

interface Props {
  config: GraphConfig;
  header: string;
  icon?: string;
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'mdi-file-export',
  label: 'Export graph to CSV',
});

async function exportData(): Promise<void> {
  const historyStore = useHistoryStore();
  const precision = await selectGraphPrecision();
  if (precision) {
    notify.info('Generating CSV... This may take a few seconds.');
    await historyStore.downloadGraphCsv(props.config, precision, props.header);
  }
}
</script>

<template>
  <ActionItem
    v-bind="{ ...$attrs, ...$props }"
    @click="exportData"
  />
</template>
