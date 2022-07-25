<script lang="ts">
import { useBlockWidget } from '@/plugins/spark/composables';
import { saveFile } from '@/utils/import-export';
import { SetpointProfileBlock } from 'brewblox-proto/ts';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ProfileExportAction',
  props: {
    icon: {
      type: String,
      default: 'mdi-file-export',
    },
    label: {
      type: String,
      default: 'Export profile to file',
    },
  },
  setup() {
    const { block } = useBlockWidget.setup<SetpointProfileBlock>();

    function startExport(): void {
      const { points } = block.value.data;
      saveFile(
        { points },
        `${block.value.serviceId}-${block.value.id}.profile.json`,
      );
    }

    return {
      startExport,
    };
  },
});
</script>

<template>
  <ActionItem
    v-bind="{ ...$attrs, ...$props }"
    @click="startExport"
  />
</template>
