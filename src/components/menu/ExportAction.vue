<script setup lang="ts">
import { useWidget } from '@/composables';
import { saveFile } from '@/utils/import-export';

interface Props {
  icon?: string;
  label?: string;
}

withDefaults(defineProps<Props>(), {
  icon: 'mdi-file-export',
  label: 'Export widget',
});

const { widget } = useWidget.setup();

async function startExport(): Promise<void> {
  const { id, dashboard, pinnedPosition, ...exported } = widget.value;
  void { id, dashboard, pinnedPosition };
  saveFile(
    exported,
    `brewblox-${widget.value.title}-${widget.value.feature}.json`,
  );
}
</script>

<template>
  <ActionItem
    v-bind="{ ...$attrs, ...$props }"
    @click="startExport"
  />
</template>
