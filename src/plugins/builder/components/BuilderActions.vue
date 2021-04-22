<script lang="ts">
import { uid } from 'quasar';
import { computed, defineComponent } from 'vue';

import { defaultLayoutHeight, defaultLayoutWidth } from '@/plugins/builder/const';
import { BuilderLayout } from '@/plugins/builder/types';
import { createDialog } from '@/utils/dialog';
import { deepCopy } from '@/utils/functional';
import { loadFile } from '@/utils/import-export';

import { builderStore } from '../store';


@Component
export default class BuilderActions extends Vue {

  @Prop({ type: Object, default: null })
  public readonly layout!: BuilderLayout | null;

  selectLayout(id: string | null): void {
    this.$emit('selected', id);
  }

  startAddLayout(copy: boolean): void {
    createDialog({
      component: 'InputDialog',
      title: 'Add Layout',
      message: 'Create a new Brewery Builder layout',
      value: 'Brewery Layout',
    })
      .onOk(async title => {
        const id = uid();
        await builderStore.createLayout({
          id,
          title,
          width: copy && this.layout ? this.layout.width : defaultLayoutWidth,
          height: copy && this.layout ? this.layout.height : defaultLayoutHeight,
          parts: copy && this.layout ? deepCopy(this.layout.parts) : [],
        });
        this.selectLayout(id);
      });
  }

  async importLayout(): Promise<void> {
    loadFile<BuilderLayout>(async layout => {
      const id = uid();
      await builderStore.createLayout({ ...layout, id });
      this.selectLayout(id);
    });
  }
}
</script>


<template>
  <ActionMenu v-bind="{...$attrs}">
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
