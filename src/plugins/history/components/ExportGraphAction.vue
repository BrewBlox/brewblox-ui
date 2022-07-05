<script lang="ts">
import { PropType, defineComponent } from 'vue';

import { useHistoryStore } from '@/plugins/history/store';
import { GraphConfig } from '@/plugins/history/types';
import { selectGraphPrecision } from '@/plugins/history/utils';
import { notify } from '@/utils/notify';

export default defineComponent({
  name: 'ExportGraphAction',
  props: {
    icon: {
      type: String,
      default: 'mdi-file-export',
    },
    label: {
      type: String,
      default: 'Export graph to CSV',
    },
    header: {
      type: String,
      required: true,
    },
    config: {
      type: Object as PropType<GraphConfig>,
      required: true,
    },
  },
  setup(props) {
    async function exportData(): Promise<void> {
      const historyStore = useHistoryStore();
      const precision = await selectGraphPrecision();
      if (precision) {
        notify.info('Generating CSV... This may take a few seconds.');
        await historyStore.downloadGraphCsv(
          props.config,
          precision,
          props.header,
        );
      }
    }

    return {
      exportData,
    };
  },
});
</script>

<template>
  <ActionItem
    v-bind="{ ...$attrs, ...$props }"
    @click="exportData"
  />
</template>
