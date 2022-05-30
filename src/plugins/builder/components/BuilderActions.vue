<script lang="ts">
import { nanoid } from 'nanoid';
import { PropType, defineComponent } from 'vue';
import { useRouter } from 'vue-router';

import { useBuilderStore } from '@/plugins/builder/store';
import { BuilderLayout } from '@/plugins/builder/types';
import { loadFile } from '@/utils/import-export';

import { startAddLayout } from '../utils';

export default defineComponent({
  name: 'BuilderActions',
  props: {
    layout: {
      type: Object as PropType<BuilderLayout | null>,
      default: null,
    },
  },
  setup() {
    const builderStore = useBuilderStore();
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
      loadFile<BuilderLayout>(async (layout) => {
        const id = nanoid();
        await builderStore.createLayout({ ...layout, id });
        selectLayout(id);
      });
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
      <LayoutActions
        :layout="layout"
        @selected="selectLayout"
      />
      <slot name="menus" />
    </template>
    <slot />
  </ActionMenu>
</template>
