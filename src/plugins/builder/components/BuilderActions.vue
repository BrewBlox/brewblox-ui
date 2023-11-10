<script setup lang="ts">
import { useRouter } from 'vue-router';
import { BuilderLayout } from '@/plugins/builder/types';
import { startCreateLayout, startImportLayout } from '../utils';

interface Props {
  layout?: BuilderLayout | null;
}

withDefaults(defineProps<Props>(), {
  layout: null,
});

const router = useRouter();

function selectLayout(id: string): void {
  router.push(`/builder/${id}`).catch(() => {});
}

async function importLayout(): Promise<void> {
  startImportLayout((id) => selectLayout(id));
}
</script>

<template>
  <ActionMenu>
    <template #actions>
      <slot name="actions" />
      <ActionItem
        icon="add"
        label="New Layout"
        @click="startCreateLayout($router)"
      />
      <ActionItem
        icon="mdi-file-import"
        label="Import Layout"
        @click="importLayout"
      />
    </template>
    <template #menus>
      <LayoutActionsMenu :layout="layout" />
      <slot name="menus" />
    </template>
    <slot />
  </ActionMenu>
</template>
