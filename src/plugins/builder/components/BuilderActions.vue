<script lang="ts">
import { nanoid } from 'nanoid';
import { defineComponent, PropType } from 'vue';

import { defaultLayoutHeight, defaultLayoutWidth } from '@/plugins/builder/const';
import { BuilderLayout } from '@/plugins/builder/types';
import { createDialog } from '@/utils/dialog';
import { deepCopy } from '@/utils/functional';
import { loadFile } from '@/utils/import-export';

import { builderStore } from '../store';

export default defineComponent({
  name: 'BuilderActions',
  props: {
    layout: {
      type: Object as PropType<BuilderLayout | null>,
      default: null,
    },
  },
  emits: [
    'selected',
  ],
  setup(props, { emit }) {

    function selectLayout(id: string | null): void {
      emit('selected', id);
    }

    function startAddLayout(copy: boolean): void {
      createDialog({
        component: 'InputDialog',
        componentProps: {
          modelValue: 'Brewery Layout',
          title: 'Add Layout',
          message: 'Create a new Brewery Builder layout',
        },
      })
        .onOk(async title => {
          const id = nanoid();
          await builderStore.createLayout({
            id,
            title,
            width: copy && props.layout ? props.layout.width : defaultLayoutWidth,
            height: copy && props.layout ? props.layout.height : defaultLayoutHeight,
            parts: copy && props.layout ? deepCopy(props.layout.parts) : [],
          });
          selectLayout(id);
        });
    }

    async function importLayout(): Promise<void> {
      loadFile<BuilderLayout>(async layout => {
        const id = nanoid();
        await builderStore.createLayout({ ...layout, id });
        selectLayout(id);
      });
    }

    return {
      selectLayout,
      startAddLayout,
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
        @click="startAddLayout(false)"
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
