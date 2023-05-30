<script setup lang="ts">
import { useBlockWidget } from '@/plugins/spark/composables';
import { loadFile } from '@/utils/import-export';
import { notify } from '@/utils/notify';
import { SetpointProfileBlock } from 'brewblox-proto/ts';

defineProps({
  icon: {
    type: String,
    default: 'mdi-file-import',
  },
  label: {
    type: String,
    default: 'Import profile from file',
  },
});

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
</script>

<template>
  <ActionItem
    v-bind="{ ...$attrs, ...$props }"
    @click="showDialog"
  />
</template>
