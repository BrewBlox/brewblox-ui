<script lang="ts">
import { useBlockWidget } from '@/plugins/spark/composables';
import { loadFile } from '@/utils/import-export';
import { notify } from '@/utils/notify';
import { SetpointProfileBlock } from 'brewblox-proto/ts';
import { defineComponent } from 'vue';

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
    const { patchBlock } = useBlockWidget.setup<SetpointProfileBlock>();

    async function showDialog(): Promise<void> {
      loadFile((cfg: Pick<SetpointProfileBlock['data'], 'points'>) => {
        if (cfg.points === undefined) {
          notify.error('Invalid configuration file');
          return;
        }
        patchBlock({ points: cfg.points });
      });
    }

    return {
      showDialog,
    };
  },
});
</script>

<template>
  <ActionItem
    v-bind="{ ...$attrs, ...$props }"
    @click="showDialog"
  />
</template>
