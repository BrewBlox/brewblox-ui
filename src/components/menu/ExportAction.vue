<script lang="ts">
import { defineComponent } from 'vue';

import { useCrud } from '@/composables';
import { saveFile } from '@/utils/import-export';

export default defineComponent({
  name: 'ExportAction',
  props: {
    ...useCrud.props,
    icon: {
      type: String,
      default: 'mdi-file-export',
    },
    label: {
      type: String,
      default: 'Export widget',
    },
  },
  setup(props) {
    const { crud } = useCrud.setup(props.crud);

    async function startExport(): Promise<void> {
      const { id, dashboard, pinnedPosition, ...exported } = crud.widget;
      void { id, dashboard, pinnedPosition };
      saveFile(exported, `brewblox-${crud.widget.title}-${crud.widget.feature}.json`);
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
