<script lang="ts">
import { BuilderLayout } from '@/plugins/builder/types';
import { defineComponent, PropType } from 'vue';
import { useRouter } from 'vue-router';
import { startAddLayout, startImportLayout } from '../utils';

export default defineComponent({
  name: 'BuilderActions',
  props: {
    layout: {
      type: null as unknown as PropType<BuilderLayout | null>,
      default: null,
    },
  },
  setup() {
    const router = useRouter();

    function selectLayout(id: string): void {
      router.push(`/builder/${id}`).catch(() => {});
    }

    async function createLayout(): Promise<void> {
      const id = await startAddLayout();
      if (id) {
        selectLayout(id);
      }
    }

    async function importLayout(): Promise<void> {
      startImportLayout((id) => selectLayout(id));
    }

    return {
      selectLayout,
      createLayout,
      importLayout,
    };
  },
});
</script>

<template>
  <ActionMenu>
    <template #actions>
      <slot name="actions" />
      <ActionItem
        icon="add"
        label="New Layout"
        @click="createLayout"
      />
      <ActionItem
        icon="mdi-file-import"
        label="Import Layout"
        @click="importLayout"
      />
    </template>
    <template #menus>
      <LayoutActionsMenu
        :layout="layout"
        @selected="selectLayout"
      />
      <slot name="menus" />
    </template>
    <slot />
  </ActionMenu>
</template>
