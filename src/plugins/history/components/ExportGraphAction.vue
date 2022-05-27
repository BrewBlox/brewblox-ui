<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { GraphConfig } from '@/plugins/history/types';
import { notify } from '@/utils/notify';

import { saveGraphToFile, selectGraphPrecision } from '../utils';

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
      const precision = await selectGraphPrecision();
      if (precision) {
        notify.info('Generating CSV... This may take a few seconds.');
        await saveGraphToFile(props.config, precision, props.header);
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
