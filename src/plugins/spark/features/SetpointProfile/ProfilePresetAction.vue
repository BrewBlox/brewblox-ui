<script setup lang="ts">
import ProfileSnippetDialog from './ProfileSnippetDialog.vue';
import { useBlockWidget } from '@/plugins/spark/composables';
import { createComponentDialog } from '@/utils/dialog';
import { SetpointProfileBlock } from 'brewblox-proto/ts';

defineProps({
  icon: {
    type: String,
    default: 'mdi-file',
  },
  label: {
    type: String,
    default: 'Load/Save profile',
  },
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
