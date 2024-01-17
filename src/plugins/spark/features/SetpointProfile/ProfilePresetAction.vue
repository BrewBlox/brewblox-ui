<script setup lang="ts">
import { SetpointProfileBlock } from 'brewblox-proto/ts';
import { useBlockWidget } from '@/plugins/spark/composables';
import { createComponentDialog } from '@/utils/dialog';
import ProfileSnippetDialog from './ProfileSnippetDialog.vue';

interface Props {
  icon?: string;
  label?: string;
}

withDefaults(defineProps<Props>(), {
  icon: 'mdi-file',
  label: 'Load/Save profile',
});

const { block } = useBlockWidget.setup<SetpointProfileBlock>();

async function showDialog(): Promise<void> {
  createComponentDialog({
    component: ProfileSnippetDialog,
    componentProps: {
      block: block.value,
      title: 'Load/Save Profile',
    },
  });
}
</script>

<template>
  <ActionItem
    v-bind="{ ...$attrs, ...$props }"
    @click="showDialog"
  />
</template>
