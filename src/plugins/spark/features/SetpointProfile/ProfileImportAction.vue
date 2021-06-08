<script lang="ts">
import { defineComponent } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';
import { SetpointProfileBlock } from '@/plugins/spark/types';
import { loadFile, notify } from '@/utils';


export default defineComponent({
  name: 'ProfileImportAction',
  props: {
    icon: {
      type: String,
      default: 'mdi-file-import',
    },
    label: {
      type: String,
      default: 'Import profile from file',
    },
  },
  setup() {
    const {
      block,
      saveBlock,
    } = useBlockWidget.setup<SetpointProfileBlock>();

    async function showDialog(): Promise<void> {
      loadFile((cfg: Pick<SetpointProfileBlock['data'], 'points'>) => {
        if (cfg.points === undefined) {
          notify.error('Invalid configuration file');
          return;
        }
        block.value.data.points = cfg.points;
        saveBlock();
      });
    }

    return {
      showDialog,
    };
  },
});
</script>

<template>
  <ActionItem v-bind="{...$attrs, ...$props}" @click="showDialog" />
</template>
