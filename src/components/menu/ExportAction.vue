<script lang="ts">
import { defineComponent } from 'vue';

import { useWidget } from '@/composables';
import { saveFile } from '@/utils/import-export';

export default defineComponent({
  name: 'ExportAction',
  props: {
    icon: {
      type: String,
      default: 'mdi-file-export',
    },
    label: {
      type: String,
      default: 'Export widget',
    },
  },
  setup() {
    const { widget } = useWidget.setup();

    async function startExport(): Promise<void> {
      const { id, dashboard, pinnedPosition, ...exported } = widget.value;
      void { id, dashboard, pinnedPosition };
      saveFile(exported, `brewblox-${widget.value.title}-${widget.value.feature}.json`);
    }

    return {
      startExport,
    };
  },
});
</script>

<template>
  <ActionItem v-bind="{...$attrs, ...$props}" @click="startExport" />
</template>
